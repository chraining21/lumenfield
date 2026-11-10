package com.lumenfield;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import org.springframework.transaction.annotation.Transactional;

// 後台產品 API 與上傳；dev 種子資料提供產品 1～8、分類 1～14
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
@WithMockUser(roles = "ADMIN")
class AdminProductApiTests {

	static final byte[] PNG = { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0 };

	@Autowired
	MockMvcTester mvc;

	@Test
	@WithMockUser(roles = {})
	void needsAdmin() {
		assertThat(mvc.get().uri("/api/admin/products")).hasStatus(HttpStatus.FORBIDDEN);
	}

	@Test
	void listShowsHiddenPrices() {
		assertThat(mvc.get().uri("/api/admin/products")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.length()", v -> v.assertThat().isEqualTo(8))
			.hasPathSatisfying("$[0].price", v -> v.assertThat().isNotNull());
	}

	@Test
	void createThenVisibleOnPublicApi() {
		assertThat(send("POST", "/api/admin/products", body("lf-new-01", "LF-NEW-01"))).hasStatus(HttpStatus.CREATED)
			.bodyJson()
			.hasPathSatisfying("$.id", v -> v.assertThat().isNotNull())
			.hasPathSatisfying("$.categoryIds", v -> v.assertThat().asArray().containsExactly(1, 5))
			.hasPathSatisfying("$.images[*].url", v -> v.assertThat().asArray().containsExactly("/files/a.jpg", "/files/b.jpg"));

		assertThat(mvc.get().uri("/api/products/lf-new-01")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.name.zh", v -> v.assertThat().isEqualTo("新燈"))
			.hasPathSatisfying("$.files[0].fileName", v -> v.assertThat().isEqualTo("new.pdf"));
	}

	@Test
	void rejectsDuplicateSlugOrModel() {
		assertThat(send("POST", "/api/admin/products", body("lf-dl-090", "LF-NEW-02"))).hasStatus(HttpStatus.CONFLICT)
			.bodyJson()
			.hasPathSatisfying("$.detail", v -> v.assertThat().isEqualTo("slug"));
		assertThat(send("POST", "/api/admin/products", body("lf-new-02", "LF-DL-090"))).hasStatus(HttpStatus.CONFLICT)
			.bodyJson()
			.hasPathSatisfying("$.detail", v -> v.assertThat().isEqualTo("modelNo"));
		// 修改自己時，自己的網址代稱與型號不算重複
		assertThat(send("PUT", "/api/admin/products/1", body("lf-dl-090", "LF-DL-090"))).hasStatusOk();
	}

	@Test
	void updateReplacesImagesAndCategories() {
		String reordered = body("lf-dl-090", "LF-DL-090").replace("\"/files/a.jpg\"", "\"/files/x.jpg\"")
			.replace("[1, 5]", "[2]");
		assertThat(send("PUT", "/api/admin/products/1", reordered)).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.images[*].url", v -> v.assertThat().asArray().containsExactly("/files/x.jpg", "/files/b.jpg"))
			.hasPathSatisfying("$.applicationImages.length()", v -> v.assertThat().isEqualTo(0))
			.hasPathSatisfying("$.categoryIds", v -> v.assertThat().asArray().containsExactly(2));
		assertThat(send("PUT", "/api/admin/products/999", body("x", "X"))).hasStatus(HttpStatus.NOT_FOUND);
	}

	@Test
	void rejectsInvalidInput() {
		String ok = body("lf-new-03", "LF-NEW-03");
		assertThat(send("POST", "/api/admin/products", ok.replace("/files/a.jpg", "javascript:alert(1)")))
			.hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(send("POST", "/api/admin/products", ok.replace("\"price\": 1500", "\"price\": null")))
			.hasStatus(HttpStatus.BAD_REQUEST);
		// 9 是案例分類，不能掛在產品上
		assertThat(send("POST", "/api/admin/products", ok.replace("[1, 5]", "[1, 9]"))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(send("POST", "/api/admin/products", ok.replace("lf-new-03", "Bad Slug"))).hasStatus(HttpStatus.BAD_REQUEST);
	}

	@Test
	void uploadsImageAndServesIt() throws Exception {
		MvcTestResult upload = mvc.post()
			.uri("/api/admin/uploads")
			.multipart()
			.file(new MockMultipartFile("file", "photo.PNG", "image/png", PNG))
			.param("type", "image")
			.exchange();
		assertThat(upload).hasStatus(HttpStatus.CREATED)
			.bodyJson()
			.hasPathSatisfying("$.url", v -> v.assertThat().asString().matches("/files/\\d{4}/\\d{2}/[0-9a-f-]{36}\\.png"))
			.hasPathSatisfying("$.fileName", v -> v.assertThat().isEqualTo("photo.PNG"));

		String url = upload.getResponse().getContentAsString().replaceAll(".*\"url\":\"([^\"]+)\".*", "$1");
		assertThat(mvc.get().uri("/api" + url)).hasStatusOk()
			.hasContentType(MediaType.IMAGE_PNG)
			.hasHeader(HttpHeaders.CACHE_CONTROL, "max-age=31536000, public, immutable")
			.hasBodyTextEqualTo(new String(PNG, java.nio.charset.StandardCharsets.ISO_8859_1));
	}

	@Test
	void rejectsBadUploads() {
		assertThat(upload("fake.png", "image", "not an image".getBytes())).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(upload("virus.exe", "file", PNG)).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(upload("page.html", "image", PNG)).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(upload("catalog.pdf", "file", "%PDF-1.7".getBytes())).hasStatus(HttpStatus.CREATED);
		// 路徑穿越：編碼斜線由 Spring Security 防火牆先擋（400），格式不符的檔名由 LocalFileStorage 擋（404）
		assertThat(mvc.get().uri("/api/files/2026/11/..%2F..%2Fapplication.properties")).hasStatus4xxClientError();
		assertThat(mvc.get().uri("/api/files/2026/11/application.properties")).hasStatus(HttpStatus.NOT_FOUND);
	}

	@Test
	@WithMockUser(roles = {})
	void uploadNeedsAdmin() {
		assertThat(upload("photo.png", "image", PNG)).hasStatus(HttpStatus.FORBIDDEN);
	}

	private MvcTestResult upload(String name, String type, byte[] content) {
		return mvc.post()
			.uri("/api/admin/uploads")
			.multipart()
			.file(new MockMultipartFile("file", name, null, content))
			.param("type", type)
			.exchange();
	}

	private MvcTestResult send(String method, String uri, String json) {
		var req = "PUT".equals(method) ? mvc.put() : mvc.post();
		return req.uri(uri).contentType(MediaType.APPLICATION_JSON).content(json).exchange();
	}

	private static String body(String slug, String modelNo) {
		return """
				{"slug": "%s", "modelNo": "%s", "name": {"zh": "新燈", "en": "New Light"},
				 "wattage": "6W", "colorTemperature": "", "dimensions": null, "ipRating": "IP20",
				 "price": 1500, "priceVisible": true, "categoryIds": [1, 5],
				 "images": [{"url": "/files/a.jpg"}, {"url": "/files/b.jpg"}], "applicationImages": [],
				 "files": [{"kind": "CATALOG_PDF", "url": "/files/new.pdf", "fileName": "new.pdf", "sizeBytes": 1000}]}"""
			.formatted(slug, modelNo);
	}

}
