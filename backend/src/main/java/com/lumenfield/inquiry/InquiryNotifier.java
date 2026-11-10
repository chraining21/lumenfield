package com.lumenfield.inquiry;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 新詢價寄 Email 通知管理者（SPEC §7 第 4 步）。在背景寄送：寄信失敗或很慢都不影響客人送出。
 * Reply-To 設為客人信箱，管理者直接回覆即可。
 */
@Component
public class InquiryNotifier {

	private static final Logger log = LoggerFactory.getLogger(InquiryNotifier.class);

	private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
		.withZone(ZoneId.of("Asia/Taipei"));

	/** 沒設定 spring.mail.host 時不存在，此時不寄 */
	private final JavaMailSender mail;

	private final List<String> recipients;

	private final String from;

	private final String adminUrl;

	InquiryNotifier(ObjectProvider<JavaMailSender> mail,
			// TODO: 收件人待確認（SPEC §10）；未設定就不寄
			@Value("${app.inquiry.notify-to:}") List<String> recipients,
			@Value("${app.mail.from}") String from,
			@Value("${app.admin-url}") String adminUrl) {
		this.mail = mail.getIfAvailable();
		this.recipients = recipients.stream().filter(s -> !s.isBlank()).toList();
		this.from = from;
		this.adminUrl = adminUrl;
	}

	/** 由呼叫端在交易完成後呼叫；傳入的是已建立好的詢價快照，不再讀資料庫。 */
	@Async
	public void notifyNew(Summary inquiry) {
		if (mail == null || recipients.isEmpty()) {
			log.warn("Inquiry {} saved but mail is not configured (spring.mail.host / app.inquiry.notify-to)",
					inquiry.inquiryNo());
			return;
		}
		SimpleMailMessage msg = new SimpleMailMessage();
		msg.setFrom(from);
		msg.setTo(recipients.toArray(String[]::new));
		msg.setReplyTo(inquiry.email());
		msg.setSubject("[明野詢價] " + inquiry.inquiryNo() + " " + inquiry.contactName()
				+ (inquiry.companyName() == null ? "" : "（" + inquiry.companyName() + "）"));
		msg.setText(body(inquiry));
		try {
			mail.send(msg);
		}
		catch (MailException ex) {
			// 詢價已存進資料庫，後台看得到；這裡只記錄寄信失敗
			log.error("Failed to send notification for inquiry {}", inquiry.inquiryNo(), ex);
		}
	}

	private String body(Summary q) {
		String items = q.items()
			.stream()
			.map(i -> "- " + i.modelNo() + "  " + i.nameZh() + "  × " + i.quantity())
			.collect(Collectors.joining("\n"));
		return """
				收到新的詢價。

				編號：%s
				時間：%s
				聯絡人：%s
				公司：%s
				Email：%s
				電話：%s
				填寫語系：%s

				詢價產品：
				%s

				需求說明：
				%s

				後台查看：%s/inquiries/%d
				直接回覆這封信即可回給客人。
				""".formatted(q.inquiryNo(), TIME.format(q.createdAt()), q.contactName(), orDash(q.companyName()),
				q.email(), orDash(q.phone()), q.locale() == ContentLocale.EN ? "英文（請用英文回覆）" : "中文", items,
				orDash(q.message()), adminUrl, q.id());
	}

	private static String orDash(String s) {
		return s == null ? "—" : s;
	}

	/** 寄信需要的資料，在交易內先取好，避免背景執行緒再碰 JPA 實體。 */
	public record Summary(Long id, String inquiryNo, java.time.Instant createdAt, String contactName,
			String companyName, String email, String phone, String message, ContentLocale locale, List<Item> items) {

		public record Item(String modelNo, String nameZh, int quantity) {
		}

		static Summary of(Inquiry q) {
			return new Summary(q.getId(), q.getInquiryNo(), q.getCreatedAt(), q.getContactName(), q.getCompanyName(),
					q.getEmail(), q.getPhone(), q.getMessage(), q.getLocale(),
					q.getItems()
						.stream()
						.map(i -> new Item(i.getModelNoSnapshot(), i.getProductNameSnapshot().zh(), i.getQuantity()))
						.toList());
		}

	}

}
