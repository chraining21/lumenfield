package com.lumenfield.inquiry;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** 後台查看詢價（需登入）；SPEC §8：詢價只能查看。 */
@RestController
@RequestMapping("/api/admin/inquiries")
class AdminInquiryController {

	private final InquiryRepository inquiries;

	AdminInquiryController(InquiryRepository inquiries) {
		this.inquiries = inquiries;
	}

	/** 新到舊 */
	@GetMapping
	@Transactional(readOnly = true)
	List<InquiryDto> list() {
		return inquiries.findAllByOrderByCreatedAtDesc().stream().map(InquiryDto::from).toList();
	}

	@GetMapping("/{id}")
	@Transactional(readOnly = true)
	InquiryDto get(@PathVariable long id) {
		return inquiries.findById(id)
			.map(InquiryDto::from)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
	}

}
