package com.lumenfield.admin;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

/**
 * /api/admin/** 需要登入（ADR-001 §6），其餘公開。登入狀態存在後端 Session。
 * VIEWER（公開 demo 帳號）只能讀：GET 與登出，其他寫入一律 403。
 * <p>
 * 不開 CSRF：後端只給 Next 伺服器呼叫，瀏覽器不直接連後端、也不持有後端網域的 cookie，
 * 沒有跨站請求偽造的途徑；瀏覽器到 Next 這段由 Next Server Action 的來源檢查負責。
 */
@Configuration
class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests(a -> a.requestMatchers("/api/admin/login")
			.permitAll()
			.requestMatchers(HttpMethod.GET, "/api/admin/**")
			.hasAnyRole(AdminRole.ADMIN.name(), AdminRole.VIEWER.name())
			.requestMatchers(HttpMethod.POST, "/api/admin/logout")
			.hasAnyRole(AdminRole.ADMIN.name(), AdminRole.VIEWER.name())
			.requestMatchers("/api/admin/**")
			.hasRole(AdminRole.ADMIN.name())
			.anyRequest()
			.permitAll())
			.csrf(AbstractHttpConfigurer::disable)
			.formLogin(AbstractHttpConfigurer::disable)
			.httpBasic(AbstractHttpConfigurer::disable)
			.logout(AbstractHttpConfigurer::disable)
			// 沒登入回 401，不轉址到登入頁（轉址由前端處理）
			.exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));
		return http.build();
	}

	/** 支援 $2a$／$2b$／$2y$ 開頭的 BCrypt 雜湊 */
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	UserDetailsService userDetailsService(AdminUserRepository admins) {
		return username -> admins.findByUsername(username)
			.map(u -> User.withUsername(u.getUsername()).password(u.getPasswordHash()).roles(u.getRole().name()).build())
			.orElseThrow(() -> new UsernameNotFoundException(username));
	}

	@Bean
	AuthenticationManager authenticationManager(UserDetailsService users, PasswordEncoder encoder) {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider(users);
		provider.setPasswordEncoder(encoder);
		return new ProviderManager(provider);
	}

}
