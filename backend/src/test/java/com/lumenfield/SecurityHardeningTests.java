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

// 公開 demo 的防護：內部密鑰、依訪客 IP 的詢價限量與登入鎖定、唯讀帳號不鎖定、唯讀帳號看到遮罩過的聯絡資料
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@TestPropertySource(properties = { "app.internal-token=test-token", "app.inquiry.max-per-hour=3",
		"app.inquiry.max-per-ip-per-hour=2",
		"app.admin.viewer.username=viewer" })
@DirtiesContext
@Transactional
class SecurityHardeningTests {

	static final String TOKEN = "X-Internal-Token";

	static final String CLIENT_IP = "X-Client-IP";

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
	void limitsInquiriesPerVisitorAndInTotal() {
		assertThat(inquiry("203.0.113.1")).hasStatus(HttpStatus.CREATED);
		assertThat(inquiry("203.0.113.1")).hasStatus(HttpStatus.CREATED);
		// 同一個訪客超過自己的上限
		assertThat(inquiry("203.0.113.1")).hasStatus(HttpStatus.TOO_MANY_REQUESTS);
		// 其他訪客照常送出
		assertThat(inquiry("203.0.113.2")).hasStatus(HttpStatus.CREATED);
		// 全站總量用完，換 IP 也擋
		assertThat(inquiry("203.0.113.3")).hasStatus(HttpStatus.TOO_MANY_REQUESTS);
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
			login("198.51.100.1", "locked-admin", "wrong");
		}
		assertThat(login("198.51.100.1", "locked-admin", "admin-password")).hasStatus(HttpStatus.TOO_MANY_REQUESTS);
		// 只鎖住輸錯的那個 IP：管理者從自己的 IP 照常登入
		assertThat(login("198.51.100.2", "locked-admin", "admin-password")).hasStatusOk();
	}

	@Test
	void malformedClientIpFallsBackToConnectionAddress() {
		admins.save(new AdminUser("ip-admin", encoder.encode("admin-password")));
		// 格式不對的 X-Client-IP 不採信：每次換不同的假值也算同一個來源，照樣鎖
		for (int i = 0; i < 5; i++) {
			login("not-an-ip-" + i, "ip-admin", "wrong");
		}
		assertThat(login("still-not-an-ip", "ip-admin", "admin-password")).hasStatus(HttpStatus.TOO_MANY_REQUESTS);
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

	private MvcTestResult inquiry(String clientIp) {
		return mvc.post()
			.uri("/api/inquiries")
			.header(TOKEN, "test-token")
			.header(CLIENT_IP, clientIp)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"contactName": "王", "email": "a@example.com", "locale": "zh",
					 "items": [{"productId": 1, "quantity": 1}]}""")
			.exchange();
	}

	private MvcTestResult login(String username, String password) {
		return login("192.0.2.1", username, password);
	}

	private MvcTestResult login(String clientIp, String username, String password) {
		return mvc.post()
			.uri("/api/admin/login")
			.header(TOKEN, "test-token")
			.header(CLIENT_IP, clientIp)
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"username\": \"" + username + "\", \"password\": \"" + password + "\"}")
			.exchange();
	}

}
