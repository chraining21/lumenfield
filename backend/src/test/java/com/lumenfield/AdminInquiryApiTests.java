package com.lumenfield;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.transaction.annotation.Transactional;

// 後台查看詢價；dev 種子資料有 6 筆，第 5 筆含已刪除的產品
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
@WithMockUser(roles = "ADMIN")
class AdminInquiryApiTests {

	@Autowired
	MockMvcTester mvc;

	@Test
	@WithMockUser(roles = {})
	void needsAdmin() {
		assertThat(mvc.get().uri("/api/admin/inquiries")).hasStatus(HttpStatus.FORBIDDEN);
	}

	@Test
	void listsNewestFirst() {
		assertThat(mvc.get().uri("/api/admin/inquiries")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.length()", v -> v.assertThat().isEqualTo(6))
			.hasPathSatisfying("$[0].inquiryNo", v -> v.assertThat().isEqualTo("INQ-20261103-0001"))
			.hasPathSatisfying("$[0].locale", v -> v.assertThat().isEqualTo("en"))
			.hasPathSatisfying("$[0].createdAt", v -> v.assertThat().isEqualTo("2026-11-03T00:51:00Z"));
	}

	@Test
	void detailKeepsSnapshotOfRemovedProduct() {
		assertThat(mvc.get().uri("/api/admin/inquiries/5")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.items[0].modelNoSnapshot", v -> v.assertThat().isEqualTo("LF-DL-075"))
			.doesNotHavePath("$.items[0].productId")
			.hasPathSatisfying("$.items[1].productId", v -> v.assertThat().isEqualTo(2));
		assertThat(mvc.get().uri("/api/admin/inquiries/999")).hasStatus(HttpStatus.NOT_FOUND);
	}

}
