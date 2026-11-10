package com.lumenfield.web;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 後端只接受 Next 伺服器的請求：設定了 {@code app.internal-token} 時，/api/** 必須帶相同的
 * X-Internal-Token 標頭，否則回 403。後端網址公開在網路上，這樣外人無法繞過前端直接呼叫 API。
 * <p>
 * 例外：/api/files/**（前台透過 Next rewrites 轉送，rewrites 無法加標頭；內容本來就公開）、
 * /actuator/health（主機的健康檢查）。沒設定 token（本機開發、測試）時不檢查。
 * <p>
 * 後端只看得到 Next 伺服器的 IP，所以 Next 會用 X-Client-IP 轉來訪客的 IP。只有 token 正確的請求
 * 才採信這個標頭，之後 {@link HttpServletRequest#getRemoteAddr()} 就是訪客 IP（登入鎖定、詢價限量用）。
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class InternalTokenFilter extends OncePerRequestFilter {

	static final String HEADER = "X-Internal-Token";

	static final String CLIENT_IP_HEADER = "X-Client-IP";

	/** IPv4／IPv6 會用到的字元；格式不對就不採信，避免奇怪的值變成計次用的 key */
	private static final Pattern IP = Pattern.compile("[0-9A-Fa-f:.]{2,45}");

	private final byte[] token;

	InternalTokenFilter(@Value("${app.internal-token:}") String token) {
		this.token = token.getBytes(StandardCharsets.UTF_8);
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = request.getRequestURI();
		return token.length == 0 || !path.startsWith("/api/") || path.startsWith("/api/files/");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String given = request.getHeader(HEADER);
		// 固定時間比較，避免從回應時間猜出 token
		if (given == null || !MessageDigest.isEqual(token, given.getBytes(StandardCharsets.UTF_8))) {
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}
		String clientIp = request.getHeader(CLIENT_IP_HEADER);
		if (clientIp != null && IP.matcher(clientIp).matches()) {
			request = new HttpServletRequestWrapper(request) {
				@Override
				public String getRemoteAddr() {
					return clientIp;
				}
			};
		}
		chain.doFilter(request, response);
	}

}
