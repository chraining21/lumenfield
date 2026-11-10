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
