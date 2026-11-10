package com.lumenfield;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import com.lumenfield.product.ProductRepository;

// 前台公開 API，用 dev 種子資料（前端 mocks 轉出）驗證輸出格式與前端型別一致
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
class PublicApiTests {

	@Autowired
	MockMvcTester mvc;

	@Autowired
	ProductRepository products;

	@Autowired
	EntityManager em;

	@Test
	void listsCategories() {
		assertThat(mvc.get().uri("/api/categories")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.length()", v -> v.assertThat().isEqualTo(14))
			.hasPathSatisfying("$[0].name.zh", v -> v.assertThat().isEqualTo("嵌燈／筒燈"));
	}

	@Test
	void listsProductsWithPublicPrices() {
		assertThat(mvc.get().uri("/api/products")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.length()", v -> v.assertThat().isEqualTo(8))
			.hasPathSatisfying("$[0].slug", v -> v.assertThat().isEqualTo("lf-dl-090"))
			.hasPathSatisfying("$[0].price", v -> v.assertThat().asNumber().satisfies(n -> assertThat(new BigDecimal(n.toString())).isEqualByComparingTo("1280")));
	}

	@Test
	void hidesPriceWhenNotPublic() {
		var p = products.findBySlug("lf-fl-120").orElseThrow();
		p.setPrice(new BigDecimal("9999"));
		em.flush();

		assertThat(mvc.get().uri("/api/products/lf-fl-120")).hasStatusOk()
			.bodyJson()
			.doesNotHavePath("$.price")
			.hasPathSatisfying("$.priceVisible", v -> v.assertThat().isEqualTo(false));
	}

	@Test
	void productDetailMatchesFrontendShape() {
		assertThat(mvc.get().uri("/api/products/lf-dl-090")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.modelNo", v -> v.assertThat().isEqualTo("LF-DL-090"))
			.hasPathSatisfying("$.name.en", v -> v.assertThat().isEqualTo("Deep Anti-Glare Downlight 90"))
			.hasPathSatisfying("$.categoryIds", v -> v.assertThat().asArray().containsExactly(1, 5, 6))
			.hasPathSatisfying("$.images.length()", v -> v.assertThat().isEqualTo(3))
			.hasPathSatisfying("$.applicationImages.length()", v -> v.assertThat().isEqualTo(2))
			.hasPathSatisfying("$.files[1].kind", v -> v.assertThat().isEqualTo("IES"));
	}

	@Test
	void unknownProductIs404() {
		assertThat(mvc.get().uri("/api/products/nope")).hasStatus(HttpStatus.NOT_FOUND);
	}

	@Test
	void listsProjectsNewestFirst() {
		assertThat(mvc.get().uri("/api/projects")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$[*].year", v -> v.assertThat().asArray().containsExactly(2026, 2024, 2022))
			.hasPathSatisfying("$[0].countyCode", v -> v.assertThat().isEqualTo("TW-CYQ"))
			.hasPathSatisfying("$[0].latitude", v -> v.assertThat().isNotNull())
			.doesNotHavePath("$[1].latitude");
	}

	@Test
	void projectDetail() {
		assertThat(mvc.get().uri("/api/projects/hillside-lantern-trail-2022")).hasStatusOk()
			.bodyJson()
			.hasPathSatisfying("$.title.zh", v -> v.assertThat().isEqualTo("2022 山城燈徑"))
			.hasPathSatisfying("$.images.length()", v -> v.assertThat().isEqualTo(3));
		assertThat(mvc.get().uri("/api/projects/nope")).hasStatus(HttpStatus.NOT_FOUND);
	}

}
