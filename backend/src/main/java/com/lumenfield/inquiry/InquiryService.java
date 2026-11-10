package com.lumenfield.inquiry;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.lumenfield.product.Product;
import com.lumenfield.product.ProductRepository;

@Service
public class InquiryService {

	private static final ZoneId TAIPEI = ZoneId.of("Asia/Taipei");

	private static final DateTimeFormatter YMD = DateTimeFormatter.BASIC_ISO_DATE;

	private static final int MAX_ATTEMPTS = 3;

	private final InquiryRepository inquiries;

	private final ProductRepository products;

	private final TransactionTemplate tx;

	private final InquiryNotifier notifier;

	InquiryService(InquiryRepository inquiries, ProductRepository products, TransactionTemplate tx,
			InquiryNotifier notifier) {
		this.inquiries = inquiries;
		this.products = products;
		this.tx = tx;
		this.notifier = notifier;
	}

	/**
	 * 建立詢價單，回傳對外編號 INQ-yyyyMMdd-NNNN（台灣日期、當天流水號）。
	 * 同時送出撞號時由 uk_inquiry_no 擋下，換下一號重試。
	 */
	public Inquiry create(InquiryRequest req) {
		for (int attempt = 1;; attempt++) {
			try {
				Inquiry saved = tx.execute(status -> insert(req));
				// 交易已提交才通知，避免寄出一張最後沒存成功的詢價
				notifier.notifyNew(InquiryNotifier.Summary.of(saved));
				return saved;
			}
			catch (DataIntegrityViolationException ex) {
				if (attempt >= MAX_ATTEMPTS) {
					throw ex;
				}
			}
		}
	}

	private Inquiry insert(InquiryRequest req) {
		// 同一產品出現多次就合併數量
		Map<Long, Integer> quantities = req.items()
			.stream()
			.collect(Collectors.toMap(InquiryRequest.Item::productId, InquiryRequest.Item::quantity, Integer::sum,
					LinkedHashMap::new));
		Map<Long, Product> found = products.findAllById(quantities.keySet())
			.stream()
			.collect(Collectors.toMap(Product::getId, Function.identity()));
		if (found.size() != quantities.size()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown product in inquiry");
		}

		Inquiry inquiry = new Inquiry(nextInquiryNo(), req.contactName().strip(), req.email().strip(), req.locale());
		inquiry.setCompanyName(blankToNull(req.companyName()));
		inquiry.setPhone(blankToNull(req.phone()));
		inquiry.setMessage(blankToNull(req.message()));
		quantities.forEach((id, qty) -> inquiry.addItem(InquiryItem.snapshotOf(found.get(id), qty)));
		return inquiries.saveAndFlush(inquiry);
	}

	private String nextInquiryNo() {
		String prefix = "INQ-" + LocalDate.now(TAIPEI).format(YMD) + "-";
		long seq = inquiries.countByInquiryNoStartingWith(prefix) + 1;
		return prefix + String.format("%04d", seq);
	}

	private static String blankToNull(String s) {
		return s == null || s.isBlank() ? null : s.strip();
	}

}
