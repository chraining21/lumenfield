package com.lumenfield.admin;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 後台登入／登出；成功後以 JSESSIONID 維持登入，由 Next 伺服器代為保存並轉送。 */
@RestController
@RequestMapping("/api/admin")
class AdminAuthController {

	private final AuthenticationManager authenticationManager;

	private final LoginAttempts attempts;

	private final SecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();

	AdminAuthController(AuthenticationManager authenticationManager, LoginAttempts attempts) {
		this.authenticationManager = authenticationManager;
		this.attempts = attempts;
	}

	record LoginRequest(@NotBlank @Size(max = 50) String username, @NotBlank @Size(max = 200) String password) {
	}

	record Me(String username) {
	}

	@PostMapping("/login")
	Me login(@Validated @RequestBody LoginRequest req, HttpServletRequest request, HttpServletResponse response) {
		if (attempts.isLocked(req.username())) {
			throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many failed logins, try again later");
		}
		Authentication auth;
		try {
			auth = authenticationManager
				.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(req.username(), req.password()));
		}
		catch (AuthenticationException ex) {
			attempts.failed(req.username());
			// 帳號不存在或密碼錯誤回同一個錯誤，不透露帳號是否存在
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
		}
		attempts.succeeded(req.username());

		// 防 session fixation：登入一律換新的 session
		HttpSession old = request.getSession(false);
		if (old != null) {
			old.invalidate();
		}
		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(auth);
		SecurityContextHolder.setContext(context);
		contextRepository.saveContext(context, request, response);
		return new Me(auth.getName());
	}

	@PostMapping("/logout")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void logout(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
		SecurityContextHolder.clearContext();
	}

	@GetMapping("/me")
	Me me(Authentication auth) {
		return new Me(auth.getName());
	}

}
