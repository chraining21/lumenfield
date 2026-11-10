package com.lumenfield.inquiry;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

	Optional<Inquiry> findByInquiryNo(String inquiryNo);

	List<Inquiry> findAllByOrderByCreatedAtDesc();

	long countByInquiryNoStartingWith(String prefix);

}
