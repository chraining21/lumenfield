package com.lumenfield;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Year;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import org.springframework.transaction.annotation.Transactional;

// 後台案例 API；dev 種子資料提供案例 1～3、案例分類 9～14
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
@WithMockUser(roles = "ADMIN")
class AdminProjectApiTests {

	@Autowired
	MockMvcTester mvc;

	@Test
	@WithMockUser(roles = {})
	void needsAdmin() {
		assertThat(mvc.get().uri("/api/admin/projects")).hasStatus(HttpStatus.FORBIDDEN);
	}

	@Test
	void createThenVisibleOnPublicApi() {
		assertThat(send("POST", "/api/admin/projects", body("new-project"))).hasStatus(HttpStatus.CREATED)
			.bodyJson()
			.hasPathSatisfying("$.countyCode", v -> v.assertThat().isEqualTo("TW-TNN"))
			.hasPathSatisfying("$.images[*].url", v -> v.assertThat().asArray().containsExactly("/files/c.jpg", "/files/a.jpg"));

		assertThat(mvc.get().uri("/api/projects/new-project")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.title.zh", v -> v.assertThat().isEqualTo("新案例"))
			.hasPathSatisfying("$.latitude", v -> v.assertThat().isNotNull())
			.hasPathSatisfying("$.description.en", v -> v.assertThat().isEqualTo("Desc"));
	}

	@Test
	void updateClearsOptionalFields() {
		String noExtras = body("hillside-lantern-trail-2022").replace("\"latitude\": 23.0, \"longitude\": 120.2", "\"latitude\": null, \"longitude\": null")
			.replace("{\"zh\": \"說明\", \"en\": \"Desc\"}", "{\"zh\": \"\", \"en\": \"\"}");
		assertThat(send("PUT", "/api/admin/projects/3", noExtras)).hasStatusOk()
			.bodyJson()
			.doesNotHavePath("$.latitude")
			.doesNotHavePath("$.description");
	}

	@Test
	void rejectsDuplicateSlug() {
		assertThat(send("POST", "/api/admin/projects", body("hillside-lantern-trail-2022")))
			.hasStatus(HttpStatus.CONFLICT)
			.bodyJson()
			.hasPathSatisfying("$.detail", v -> v.assertThat().isEqualTo("slug"));
	}

	@Test
	void rejectsInvalidInput() {
		String ok = body("p-x");
		int tooLate = Year.now(ZoneId.of("Asia/Taipei")).getValue() + 2;
		assertThat(send("POST", "/api/admin/projects", ok.replace("2025", String.valueOf(tooLate)))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(send("POST", "/api/admin/projects", ok.replace("2025", "1980"))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(send("POST", "/api/admin/projects", ok.replace("TW-TNN", "TW-XXX"))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(send("POST", "/api/admin/projects", ok.replace(", \"longitude\": 120.2", ""))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(send("POST", "/api/admin/projects", ok.replace("\"en\": \"Desc\"", "\"en\": \"\""))).hasStatus(HttpStatus.BAD_REQUEST);
		// 1 是產品燈型分類，不能掛在案例上
		assertThat(send("POST", "/api/admin/projects", ok.replace("[9]", "[1]"))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(send("POST", "/api/admin/projects", ok.replace("[{\"url\": \"/files/c.jpg\"}, {\"url\": \"/files/a.jpg\"}]", "[]")))
			.hasStatus(HttpStatus.BAD_REQUEST);
	}

	private MvcTestResult send(String method, String uri, String json) {
		var req = "PUT".equals(method) ? mvc.put() : mvc.post();
		return req.uri(uri).contentType(MediaType.APPLICATION_JSON).content(json).exchange();
	}

	private static String body(String slug) {
		return """
				{"slug": "%s", "title": {"zh": "新案例", "en": "New Project"},
				 "description": {"zh": "說明", "en": "Desc"}, "year": 2025,
				 "location": {"zh": "臺南市", "en": "Tainan"}, "countyCode": "TW-TNN",
				 "latitude": 23.0, "longitude": 120.2, "categoryIds": [9],
				 "images": [{"url": "/files/c.jpg"}, {"url": "/files/a.jpg"}]}""".formatted(slug);
	}

}
