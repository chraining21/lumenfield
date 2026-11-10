package com.lumenfield;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class LightBackendApplicationTests {

	@Autowired
	DataSource dataSource;

	@Test
	void connectsToMysqlWithUtf8mb4() {
		JdbcTemplate jdbc = new JdbcTemplate(dataSource);
		assertThat(jdbc.queryForObject("SELECT VERSION()", String.class)).startsWith("8.4");
		assertThat(jdbc.queryForObject("SELECT @@character_set_database", String.class)).isEqualTo("utf8mb4");
		assertThat(jdbc.queryForObject("SELECT @@collation_database", String.class)).isEqualTo("utf8mb4_unicode_ci");
	}

}
