package com.lumenfield;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

// 驗證 Flyway V1 建出的資料表與限制條件（每個測試結束自動 rollback）
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class SchemaMigrationTests {

	@Autowired
	JdbcTemplate jdbc;

	@Test
	void createsAllTables() {
		List<String> tables = jdbc.queryForList(
				"SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name <> 'flyway_schema_history'",
				String.class);
		assertThat(tables).containsExactlyInAnyOrder("category", "product", "product_category", "product_image",
				"product_file", "project", "project_category", "project_image", "inquiry", "inquiry_item", "admin_user");
	}

	@Test
	void storesChineseAndEmoji() {
		jdbc.update("INSERT INTO category (type, slug, name_zh, name_en) VALUES ('SPACE', 'test', '燈節 💡', 'Lantern')");
		assertThat(jdbc.queryForObject("SELECT name_zh FROM category WHERE slug = 'test'", String.class))
				.isEqualTo("燈節 💡");
	}

	@Test
	void rejectsDuplicateSlug() {
		insertProduct("dup", "LF-1");
		assertThatThrownBy(() -> insertProduct("dup", "LF-2")).isInstanceOf(DataAccessException.class);
	}

	@Test
	void rejectsUnknownEnumValue() {
		assertThatThrownBy(() -> jdbc.update(
				"INSERT INTO category (type, slug, name_zh, name_en) VALUES ('COLOR', 'x', '色', 'Color')"))
			.isInstanceOf(DataAccessException.class);
	}

	@Test
	void rejectsHalfFilledCoordinates() {
		assertThatThrownBy(() -> jdbc.update("""
				INSERT INTO project (slug, title_zh, title_en, year, location_zh, location_en, county_code, latitude)
				VALUES ('p', '案', 'P', 2026, '嘉義', 'Chiayi', 'TW-CYQ', 23.5)"""))
			.isInstanceOf(DataAccessException.class);
	}

	@Test
	void deletingProductKeepsInquirySnapshot() {
		long productId = insertProduct("gone", "LF-GONE");
		jdbc.update("INSERT INTO product_image (product_id, kind, url) VALUES (?, 'PRODUCT', '/a.jpg')", productId);
		jdbc.update("INSERT INTO inquiry (inquiry_no, contact_name, email, locale) VALUES ('INQ-1', '王', 'a@example.com', 'zh')");
		long inquiryId = jdbc.queryForObject("SELECT id FROM inquiry WHERE inquiry_no = 'INQ-1'", Long.class);
		jdbc.update("""
				INSERT INTO inquiry_item (inquiry_id, product_id, model_no_snapshot, product_name_snapshot_zh, product_name_snapshot_en, quantity)
				VALUES (?, ?, 'LF-GONE', '舊燈', 'Old', 2)""", inquiryId, productId);

		jdbc.update("DELETE FROM product WHERE id = ?", productId);

		assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM product_image WHERE product_id = ?", Integer.class, productId))
			.isZero();
		assertThat(jdbc.queryForMap("SELECT product_id, model_no_snapshot FROM inquiry_item WHERE inquiry_id = ?", inquiryId))
			.containsEntry("product_id", null)
			.containsEntry("model_no_snapshot", "LF-GONE");
	}

	private long insertProduct(String slug, String modelNo) {
		jdbc.update("INSERT INTO product (slug, model_no, name_zh, name_en) VALUES (?, ?, '燈', 'Light')", slug, modelNo);
		return jdbc.queryForObject("SELECT id FROM product WHERE slug = ?", Long.class, slug);
	}

}
