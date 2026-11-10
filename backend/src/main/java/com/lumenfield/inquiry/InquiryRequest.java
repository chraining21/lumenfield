package com.lumenfield.inquiry;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** 前台送出的詢價單；型號、名稱快照由後端依目前產品資料產生，不信任前端。 */
public record InquiryRequest(
		@NotBlank @Size(max = 100) String contactName,
		@Size(max = 200) String companyName,
		@NotBlank @Email @Size(max = 254) String email,
		@Size(max = 50) String phone,
		@Size(max = 5000) String message,
		@NotNull ContentLocale locale,
		@NotEmpty @Size(max = 100) List<@Valid Item> items) {

	public record Item(@NotNull Long productId, @Min(1) @Max(99_999) int quantity) {
	}

}
