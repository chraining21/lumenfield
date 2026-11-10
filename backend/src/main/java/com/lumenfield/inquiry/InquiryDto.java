package com.lumenfield.inquiry;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import com.lumenfield.common.LocalizedText;

/** 對應前端 Inquiry 型別（DATA_MODEL §6）；locale 輸出 zh／en。 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record InquiryDto(Long id, String inquiryNo, String contactName, String companyName, String email,
		String phone, String message, ContentLocale locale, List<Item> items, Instant createdAt) {

	/** productId 為 null 代表產品已刪除，只剩快照 */
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public record Item(Long id, Long productId, String modelNoSnapshot, LocalizedText productNameSnapshot,
			int quantity) {
	}

	/**
	 * 唯讀 demo 帳號看到的版本：聯絡人、Email、電話只留頭尾。公開 demo 的訪客可能填真實資料，
	 * 不讓其他訪客看到。
	 */
	InquiryDto masked() {
		return new InquiryDto(id, inquiryNo, mask(contactName), companyName, maskEmail(email), mask(phone), message,
				locale, items, createdAt);
	}

	static String mask(String s) {
		if (s == null || s.isBlank()) {
			return s;
		}
		int[] cp = s.codePoints().toArray();
		if (cp.length <= 2) {
			return new String(cp, 0, 1) + "*";
		}
		return new String(cp, 0, 1) + "*".repeat(cp.length - 2) + new String(cp, cp.length - 1, 1);
	}

	static String maskEmail(String email) {
		int at = email.indexOf('@');
		return at <= 0 ? mask(email) : mask(email.substring(0, at)) + "@" + email.substring(at + 1);
	}

	static InquiryDto from(Inquiry q) {
		return new InquiryDto(q.getId(), q.getInquiryNo(), q.getContactName(), q.getCompanyName(), q.getEmail(),
				q.getPhone(), q.getMessage(), q.getLocale(),
				q.getItems()
					.stream()
					.map(i -> new Item(i.getId(), i.getProduct() == null ? null : i.getProduct().getId(),
							i.getModelNoSnapshot(), i.getProductNameSnapshot(), i.getQuantity()))
					.toList(),
				q.getCreatedAt());
	}

}
