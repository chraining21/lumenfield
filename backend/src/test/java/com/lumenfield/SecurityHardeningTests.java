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
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import org.springframework.transaction.annotation.Transactional;

import com.lumenfield.admin.AdminRole;
import com.lumenfield.admin.AdminUser;
import com.lumenfield.admin.AdminUserRepository;

// 公開 demo 的防護：內部密鑰、詢價限量、唯讀帳號不鎖定、唯讀帳號看到遮罩過的聯絡資料
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@TestPropertySource(properties = { "app.internal-token=test-token", "app.inquiry.max-per-hour=2",
		"app.admin.viewer.username=viewer" })
@DirtiesContext
@Transactional
class SecurityHardeningTests {

	static final String TOKEN = "X-Internal-Token";

	@Autowired
	MockMvcTester mvc;

	@Autowired
	AdminUserRepository admins;

	@Autowired
	PasswordEncoder encoder;

	@Test
	void apiNeedsInternalToken() {
		assertThat(mvc.get().uri("/api/products")).hasStatus(HttpStatus.FORBIDDEN);
		assertThat(mvc.get().uri("/api/products").header(TOKEN, "wrong")).hasStatus(HttpStatus.FORBIDDEN);
		assertThat(mvc.get().uri("/api/products").header(TOKEN, "test-token")).hasStatusOk();
		assertThat(mvc.post()
			.uri("/api/admin/login")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"username\": \"admin\", \"password\": \"lf-admin-dev-only\"}")).hasStatus(HttpStatus.FORBIDDEN);
	}

	@Test
	void filesAndHealthStayOpenWithoutToken() {
		assertThat(mvc.get().uri("/api/files/2026/11/00000000-0000-0000-0000-000000000000.jpg"))
			.hasStatus(HttpStatus.NOT_FOUND);
		assertThat(mvc.get().uri("/actuator/health")).hasStatusOk();
	}

	@Test
	void limitsInquiriesPerHour() {
		assertThat(inquiry()).hasStatus(HttpStatus.CREATED);
		assertThat(inquiry()).hasStatus(HttpStatus.CREATED);
		assertThat(inquiry()).hasStatus(HttpStatus.TOO_MANY_REQUESTS);
	}

	@Test
	void viewerIsNeverLockedButOthersAre() {
		admins.save(new AdminUser("viewer", encoder.encode("viewer-password"), AdminRole.VIEWER));
		for (int i = 0; i < 6; i++) {
			assertThat(login("viewer", "wrong")).hasStatus(HttpStatus.UNAUTHORIZED);
		}
		assertThat(login("Viewer", "viewer-password")).hasStatusOk();

		admins.save(new AdminUser("locked-admin", encoder.encode("admin-password")));
		for (int i = 0; i < 5; i++) {
			login("locked-admin", "wrong");
		}
		assertThat(login("locked-admin", "admin-password")).hasStatus(HttpStatus.TOO_MANY_REQUESTS);
	}

	@Test
	void viewerSeesMaskedContactDetails() {
		admins.save(new AdminUser("viewer", encoder.encode("viewer-password"), AdminRole.VIEWER));
		MvcTestResult login = login("viewer", "viewer-password");
		MockHttpSession session = (MockHttpSession) login.getMvcResult().getRequest().getSession(false);

		// 種子資料第 1 筆：王小明／wang@example.com／0912-345-678
		assertThat(mvc.get().uri("/api/admin/inquiries/1").header(TOKEN, "test-token").session(session)).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.contactName", v -> v.assertThat().isEqualTo("王*明"))
			.hasPathSatisfying("$.email", v -> v.assertThat().isEqualTo("w**g@example.com"))
			.hasPathSatisfying("$.phone", v -> v.assertThat().isEqualTo("0**********8"));

		MvcTestResult admin = login("admin", "lf-admin-dev-only");
		MockHttpSession adminSession = (MockHttpSession) admin.getMvcResult().getRequest().getSession(false);
		assertThat(mvc.get().uri("/api/admin/inquiries/1").header(TOKEN, "test-token").session(adminSession))
			.bodyJson()
			.hasPathSatisfying("$.email", v -> v.assertThat().isEqualTo("wang@example.com"));
	}

	private MvcTestResult inquiry() {
		return mvc.post()
			.uri("/api/inquiries")
			.header(TOKEN, "test-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"contactName": "王", "email": "a@example.com", "locale": "zh",
					 "items": [{"productId": 1, "quantity": 1}]}""")
			.exchange();
	}

	private MvcTestResult login(String username, String password) {
		return mvc.post()
			.uri("/api/admin/login")
			.header(TOKEN, "test-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"username\": \"" + username + "\", \"password\": \"" + password + "\"}")
			.exchange();
	}

}
