package com.lumenfield.inquiry;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** 後台查看詢價（需登入）；SPEC §8：詢價只能查看。唯讀 demo 帳號看到遮罩過的聯絡資料。 */
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
	List<InquiryDto> list(Authentication auth) {
		return inquiries.findAllByOrderByCreatedAtDesc().stream().map(q -> view(InquiryDto.from(q), auth)).toList();
	}

	@GetMapping("/{id}")
	@Transactional(readOnly = true)
	InquiryDto get(@PathVariable long id, Authentication auth) {
		return inquiries.findById(id)
			.map(q -> view(InquiryDto.from(q), auth))
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
	}

	private static InquiryDto view(InquiryDto dto, Authentication auth) {
		boolean viewer = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_VIEWER"));
		return viewer ? dto.masked() : dto;
	}

}
