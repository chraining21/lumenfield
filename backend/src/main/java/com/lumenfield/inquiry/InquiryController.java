package com.lumenfield.inquiry;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 前台送出詢價（不需登入）。 */
@RestController
@RequestMapping("/api/inquiries")
class InquiryController {

	private final InquiryService service;

	InquiryController(InquiryService service) {
		this.service = service;
	}

	record Created(String inquiryNo) {
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	Created create(@Validated @RequestBody InquiryRequest request) {
		return new Created(service.create(request).getInquiryNo());
	}

}
