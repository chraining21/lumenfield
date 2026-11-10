package com.lumenfield;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.lumenfield.inquiry.InquiryRepository;

// 正式只有分類；dev 另外載入假資料（5-4 決定：分類進正式、假資料只在開發）
class SeedDataTests {

	@Nested
	@Import(TestcontainersConfiguration.class)
	@SpringBootTest
	class Production {

		@Autowired
		JdbcTemplate jdbc;

		@Test
		void hasCategoriesOnly() {
			assertThat(count("category")).isEqualTo(14);
			assertThat(count("product")).isZero();
			assertThat(count("project")).isZero();
			assertThat(count("inquiry")).isZero();
			assertThat(count("admin_user")).isZero();
		}

		private int count(String table) {
			return jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);
		}

	}

	@Nested
	@Import(TestcontainersConfiguration.class)
	@SpringBootTest
	@ActiveProfiles("dev")
	@Transactional
	class Dev {

		@Autowired
		JdbcTemplate jdbc;

		@Autowired
		InquiryRepository inquiries;

		@Test
		void loadsMockData() {
			assertThat(count("category")).isEqualTo(14);
			assertThat(count("product")).isEqualTo(8);
			assertThat(count("product_image")).isEqualTo(32);
			assertThat(count("product_file")).isEqualTo(24);
			assertThat(count("project")).isEqualTo(3);
			assertThat(count("project_image")).isEqualTo(9);
			assertThat(count("inquiry")).isEqualTo(6);
			assertThat(count("inquiry_item")).isEqualTo(10);
			assertThat(jdbc.queryForObject("SELECT password_hash FROM admin_user WHERE username = 'admin'", String.class))
				.startsWith("$2a$10$");
		}

		@Test
		void storesInquiryTimeInUtc() {
			// 前端假資料：2026-11-03T08:51:00+08:00
			assertThat(inquiries.findByInquiryNo("INQ-20261103-0001").orElseThrow().getCreatedAt())
				.isEqualTo(Instant.parse("2026-11-03T00:51:00Z"));
		}

		@Test
		void removedProductKeepsSnapshot() {
			assertThat(jdbc.queryForMap(
					"SELECT product_id, product_name_snapshot_zh FROM inquiry_item WHERE model_no_snapshot = 'LF-DL-075'"))
				.containsEntry("product_id", null)
				.containsEntry("product_name_snapshot_zh", "舊款嵌燈 75");
		}

		private int count(String table) {
			return jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);
		}

	}

}
