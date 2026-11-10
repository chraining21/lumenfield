package com.lumenfield;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.transaction.annotation.Transactional;

import com.lumenfield.inquiry.ContentLocale;
import com.lumenfield.inquiry.Inquiry;
import com.lumenfield.inquiry.InquiryItem;
import com.lumenfield.inquiry.InquiryRepository;

// 前台送出詢價：POST /api/inquiries（dev 種子資料提供產品 1～8）
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
class InquiryApiTests {

	static final String TODAY = LocalDate.now(ZoneId.of("Asia/Taipei")).format(DateTimeFormatter.BASIC_ISO_DATE);

	@Autowired
	MockMvcTester mvc;

	@Autowired
	InquiryRepository inquiries;

	@MockitoBean
	JavaMailSender mail;

	@Test
	void notifiesAdminByEmail() {
		assertThat(post(valid().replace("\"王\"", "\"王小明\""))).hasStatus(HttpStatus.CREATED);

		ArgumentCaptor<SimpleMailMessage> sent = ArgumentCaptor.forClass(SimpleMailMessage.class);
		// 背景寄送，等最多 3 秒
		verify(mail, timeout(3000)).send(sent.capture());
		SimpleMailMessage msg = sent.getValue();
		assertThat(msg.getTo()).containsExactly("sales@example.com");
		assertThat(msg.getReplyTo()).isEqualTo("a@example.com");
		assertThat(msg.getSubject()).isEqualTo("[明野詢價] INQ-" + TODAY + "-0001 王小明");
		assertThat(msg.getText()).contains("LF-DL-090  防眩深藏嵌燈 90  × 1")
			.contains("http://localhost:3000/admin/inquiries/");
	}

	@Test
	void createsInquiryWithSnapshotsAndDailyNumber() {
		String body = """
				{"contactName": " Emily ", "companyName": "", "email": "emily@example.com",
				 "locale": "en", "message": "Need IES files",
				 "items": [{"productId": 1, "quantity": 2}, {"productId": 7, "quantity": 1}, {"productId": 1, "quantity": 3}]}""";

		assertThat(post(body)).hasStatus(HttpStatus.CREATED)
			.bodyJson()
			.hasPathSatisfying("$.inquiryNo", v -> v.assertThat().isEqualTo("INQ-" + TODAY + "-0001"));

		Inquiry saved = inquiries.findByInquiryNo("INQ-" + TODAY + "-0001").orElseThrow();
		assertThat(saved.getContactName()).isEqualTo("Emily");
		assertThat(saved.getCompanyName()).isNull();
		assertThat(saved.getLocale()).isEqualTo(ContentLocale.EN);
		// 重複的產品合併數量，快照取自目前產品資料
		assertThat(saved.getItems()).extracting(InquiryItem::getModelNoSnapshot, InquiryItem::getQuantity)
			.containsExactly(org.assertj.core.groups.Tuple.tuple("LF-DL-090", 5),
					org.assertj.core.groups.Tuple.tuple("LF-PD-RING", 1));
		assertThat(saved.getItems().getFirst().getProductNameSnapshot().zh()).isEqualTo("防眩深藏嵌燈 90");

		assertThat(post(valid())).bodyJson()
			.hasPathSatisfying("$.inquiryNo", v -> v.assertThat().isEqualTo("INQ-" + TODAY + "-0002"));
	}

	@Test
	void rejectsInvalidInput() {
		assertThat(post(valid().replace("a@example.com", "not-an-email"))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(post(valid().replace("\"王\"", "\"  \""))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(post(valid().replace("\"zh\"", "\"fr\""))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(post(valid().replace("\"quantity\": 1", "\"quantity\": 0"))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(post(valid().replace("[{\"productId\": 1, \"quantity\": 1}]", "[]"))).hasStatus(HttpStatus.BAD_REQUEST);
	}

	@Test
	void rejectsUnknownProduct() {
		assertThat(post(valid().replace("\"productId\": 1", "\"productId\": 999"))).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(inquiries.count()).isEqualTo(6);
	}

	private String valid() {
		return """
				{"contactName": "王", "email": "a@example.com", "locale": "zh",
				 "items": [{"productId": 1, "quantity": 1}]}""";
	}

	private org.springframework.test.web.servlet.assertj.MvcTestResult post(String body) {
		return mvc.post().uri("/api/inquiries").contentType(MediaType.APPLICATION_JSON).content(body).exchange();
	}

}
