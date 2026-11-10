package com.lumenfield.web;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 後端只接受 Next 伺服器的請求：設定了 {@code app.internal-token} 時，/api/** 必須帶相同的
 * X-Internal-Token 標頭，否則回 403。後端網址公開在網路上，這樣外人無法繞過前端直接呼叫 API。
 * <p>
 * 例外：/api/files/**（前台透過 Next rewrites 轉送，rewrites 無法加標頭；內容本來就公開）、
 * /actuator/health（主機的健康檢查）。沒設定 token（本機開發、測試）時不檢查。
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class InternalTokenFilter extends OncePerRequestFilter {

	static final String HEADER = "X-Internal-Token";

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
		chain.doFilter(request, response);
	}

}
