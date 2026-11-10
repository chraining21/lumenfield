package com.lumenfield;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import org.springframework.transaction.annotation.Transactional;

import com.lumenfield.admin.AdminRole;
import com.lumenfield.admin.AdminUser;
import com.lumenfield.admin.AdminUserRepository;

// 後台登入：dev 種子資料有 admin / lf-admin-dev-only
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
class AdminAuthTests {

	@Autowired
	MockMvcTester mvc;

	@Autowired
	AdminUserRepository admins;

	@Autowired
	PasswordEncoder encoder;

	@Test
	void loginThenMeThenLogout() {
		MvcTestResult login = login("admin", "lf-admin-dev-only");
		assertThat(login).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.username", v -> v.assertThat().isEqualTo("admin"));
		MockHttpSession session = (MockHttpSession) login.getMvcResult().getRequest().getSession(false);

		assertThat(mvc.get().uri("/api/admin/me").session(session)).hasStatusOk();

		assertThat(mvc.post().uri("/api/admin/logout").session(session)).hasStatus(HttpStatus.NO_CONTENT);
		assertThat(session.isInvalid()).isTrue();
	}

	@Test
	void adminApiNeedsLogin() {
		assertThat(mvc.get().uri("/api/admin/me")).hasStatus(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void wrongPasswordAndUnknownUserLookTheSame() {
		assertThat(login("admin", "wrong")).hasStatus(HttpStatus.UNAUTHORIZED);
		assertThat(login("nobody", "wrong")).hasStatus(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void locksAfterFiveFailures() {
		admins.save(new AdminUser("locktest", encoder.encode("right-password")));
		for (int i = 0; i < 5; i++) {
			assertThat(login("locktest", "wrong")).hasStatus(HttpStatus.UNAUTHORIZED);
		}
		// 鎖住期間連正確密碼也擋
		assertThat(login("locktest", "right-password")).hasStatus(HttpStatus.TOO_MANY_REQUESTS);
	}

	@Test
	void viewerCanReadButNotWrite() {
		admins.save(new AdminUser("viewer", encoder.encode("viewer-password"), AdminRole.VIEWER));
		MvcTestResult login = login("viewer", "viewer-password");
		assertThat(login).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.role", v -> v.assertThat().isEqualTo("VIEWER"));
		MockHttpSession session = (MockHttpSession) login.getMvcResult().getRequest().getSession(false);

		assertThat(mvc.get().uri("/api/admin/me").session(session)).hasStatusOk();
		assertThat(mvc.get().uri("/api/admin/products").session(session)).hasStatusOk();
		assertThat(mvc.get().uri("/api/admin/inquiries").session(session)).hasStatusOk();

		assertThat(mvc.put()
			.uri("/api/admin/products/1")
			.session(session)
			.contentType(MediaType.APPLICATION_JSON)
			.content("{}")).hasStatus(HttpStatus.FORBIDDEN);
		assertThat(mvc.post()
			.uri("/api/admin/uploads?type=image")
			.session(session)
			.multipart()
			.file("file", new byte[] { 1 })).hasStatus(HttpStatus.FORBIDDEN);

		assertThat(mvc.post().uri("/api/admin/logout").session(session)).hasStatus(HttpStatus.NO_CONTENT);
	}

	@Test
	void adminLoginReportsAdminRole() {
		assertThat(login("admin", "lf-admin-dev-only")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.role", v -> v.assertThat().isEqualTo("ADMIN"));
	}

	@Test
	void publicApiStaysOpen() {
		assertThat(mvc.get().uri("/api/products")).hasStatusOk();
		assertThat(mvc.post()
			.uri("/api/inquiries")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"contactName": "王", "email": "a@example.com", "locale": "zh",
					 "items": [{"productId": 1, "quantity": 1}]}""")).hasStatus(HttpStatus.CREATED);
	}

	private MvcTestResult login(String username, String password) {
		return mvc.post()
			.uri("/api/admin/login")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"username\": \"" + username + "\", \"password\": \"" + password + "\"}")
			.exchange();
	}

}
