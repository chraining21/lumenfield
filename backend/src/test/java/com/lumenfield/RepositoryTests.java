package com.lumenfield;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import com.lumenfield.category.Category;
import com.lumenfield.category.CategoryRepository;
import com.lumenfield.category.CategoryType;
import com.lumenfield.common.LocalizedText;
import com.lumenfield.inquiry.ContentLocale;
import com.lumenfield.inquiry.Inquiry;
import com.lumenfield.inquiry.InquiryItem;
import com.lumenfield.inquiry.InquiryRepository;
import com.lumenfield.product.Product;
import com.lumenfield.product.ProductFile;
import com.lumenfield.product.ProductFileKind;
import com.lumenfield.product.ProductImage;
import com.lumenfield.product.ProductImageKind;
import com.lumenfield.product.ProductRepository;
import com.lumenfield.project.CountyCode;
import com.lumenfield.project.Project;
import com.lumenfield.project.ProjectImage;
import com.lumenfield.project.ProjectRepository;

// Entity 對應：存進去、清掉快取、再從資料庫讀回來比對（ddl-auto=validate 也會在啟動時檢查欄位）
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class RepositoryTests {

	@Autowired
	EntityManager em;

	@Autowired
	JdbcTemplate jdbc;

	@Autowired
	CategoryRepository categories;

	@Autowired
	ProductRepository products;

	@Autowired
	ProjectRepository projects;

	@Autowired
	InquiryRepository inquiries;

	@Test
	void productRoundTrip() {
		Category downlight = categories.save(new Category(CategoryType.LIGHT_TYPE, "t-downlight", new LocalizedText("嵌燈", "Downlights"), 1));
		Product p = new Product("t-dl-090", "T-DL-090", new LocalizedText("防眩嵌燈", "Anti-Glare Downlight"));
		p.setPrice(new BigDecimal("1280"));
		p.setPriceVisible(true);
		p.getCategories().add(downlight);
		p.addImage(new ProductImage(ProductImageKind.APPLICATION, "/app-1.jpg", 1));
		p.addImage(new ProductImage(ProductImageKind.PRODUCT, "/p-2.jpg", 2));
		p.addImage(new ProductImage(ProductImageKind.PRODUCT, "/p-1.jpg", 1));
		p.addFile(new ProductFile(ProductFileKind.IES, "/t.ies", "T-DL-090.ies", 12_000L));
		products.save(p);
		em.flush();
		em.clear();

		Product loaded = products.findBySlug("t-dl-090").orElseThrow();
		assertThat(loaded.getName()).isEqualTo(new LocalizedText("防眩嵌燈", "Anti-Glare Downlight"));
		assertThat(loaded.getPrice()).isEqualByComparingTo("1280");
		assertThat(loaded.isPriceVisible()).isTrue();
		assertThat(loaded.getCategories()).extracting(Category::getSlug).containsExactly("t-downlight");
		// 產品圖與應用照片分開讀，各自依 sortOrder 排序（第一張產品圖為主圖）
		assertThat(loaded.getProductImages()).extracting(ProductImage::getUrl).containsExactly("/p-1.jpg", "/p-2.jpg");
		assertThat(loaded.getApplicationImages()).extracting(ProductImage::getUrl).containsExactly("/app-1.jpg");
		assertThat(loaded.getProductImages().getFirst().getAlt()).isNull();
		assertThat(loaded.getFiles()).singleElement().extracting(ProductFile::getFileName).isEqualTo("T-DL-090.ies");
		assertThat(loaded.getCreatedAt()).isNotNull();
	}

	@Test
	void projectStoresCountyCodeAndCoordinates() {
		Project p = new Project("t-bridge", new LocalizedText("鐵橋照明", "Bridge Lighting"), 2026,
				new LocalizedText("嘉義縣新港鄉", "Xingang, Chiayi County"), CountyCode.CYQ);
		p.setCoordinates(new BigDecimal("23.565000"), new BigDecimal("120.302000"));
		p.addImage(new ProjectImage("/b-2.jpg", 2));
		p.addImage(new ProjectImage("/b-1.jpg", 1));
		projects.save(p);
		em.flush();
		em.clear();

		assertThat(jdbc.queryForObject("SELECT county_code FROM project WHERE slug = 't-bridge'", String.class))
			.isEqualTo("TW-CYQ");
		Project loaded = projects.findBySlug("t-bridge").orElseThrow();
		assertThat(loaded.getCountyCode()).isEqualTo(CountyCode.CYQ);
		assertThat(loaded.getLatitude()).isEqualByComparingTo("23.565");
		assertThat(loaded.getDescription()).isNull();
		assertThat(loaded.getImages()).extracting(ProjectImage::getUrl).containsExactly("/b-1.jpg", "/b-2.jpg");
	}

	@Test
	void inquiryKeepsSnapshotAfterProductChanges() {
		Product p = products.save(new Product("t-ring", "T-RING", new LocalizedText("環形吊燈", "Ring Pendant")));
		Inquiry inq = new Inquiry("INQ-T-0001", "Emily", "emily@example.com", ContentLocale.EN);
		inq.addItem(InquiryItem.snapshotOf(p, 2));
		inquiries.save(inq);
		p.setName(new LocalizedText("環形大廳吊燈", "Ring Lobby Pendant"));
		em.flush();
		em.clear();

		assertThat(jdbc.queryForObject("SELECT locale FROM inquiry WHERE inquiry_no = 'INQ-T-0001'", String.class))
			.isEqualTo("en");
		Inquiry loaded = inquiries.findByInquiryNo("INQ-T-0001").orElseThrow();
		assertThat(loaded.getLocale()).isEqualTo(ContentLocale.EN);
		InquiryItem item = loaded.getItems().getFirst();
		assertThat(item.getProductNameSnapshot().zh()).isEqualTo("環形吊燈");
		assertThat(item.getProduct().getName().zh()).isEqualTo("環形大廳吊燈");
		assertThat(item.getQuantity()).isEqualTo(2);
	}

}
