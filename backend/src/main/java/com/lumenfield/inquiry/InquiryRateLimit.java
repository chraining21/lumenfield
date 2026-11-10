package com.lumenfield.inquiry;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 全站詢價送出量上限（每小時 N 筆，0 = 不限）。公開 demo 用來防洗版塞爆免費資料庫；
 * 後端只看得到 Next 伺服器的 IP，所以不分訪客、算總量。存在記憶體，只有一台後端時足夠。
 */
@Component
class InquiryRateLimit {

	private static final Duration WINDOW = Duration.ofHours(1);

	private final int maxPerHour;

	private final Deque<Instant> recent = new ArrayDeque<>();

	InquiryRateLimit(@Value("${app.inquiry.max-per-hour:0}") int maxPerHour) {
		this.maxPerHour = maxPerHour;
	}

	/** 還有額度就記一筆並回 true */
	synchronized boolean tryAcquire() {
		if (maxPerHour <= 0) {
			return true;
		}
		Instant now = Instant.now();
		while (!recent.isEmpty() && recent.peekFirst().isBefore(now.minus(WINDOW))) {
			recent.pollFirst();
		}
		if (recent.size() >= maxPerHour) {
			return false;
		}
		recent.addLast(now);
		return true;
	}

}
