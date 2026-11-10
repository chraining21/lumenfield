package com.lumenfield.inquiry;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 詢價送出量上限（每小時，0 = 不限）：每個訪客 IP 一個上限，全站總量再一個上限。
 * 公開 demo 用來防洗版塞爆免費資料庫；洗版的人先被自己的 IP 上限擋住，一般訪客照常送出，
 * 全站總量是換很多 IP 洗版時的最後防線。IP 由 Next 以 X-Client-IP 轉來（見 InternalTokenFilter）。
 * 存在記憶體，只有一台後端時足夠。
 */
@Component
class InquiryRateLimit {

	private static final Duration WINDOW = Duration.ofHours(1);

	private record Entry(Instant at, String ip) {
	}

	private final int maxPerHour;

	private final int maxPerIpPerHour;

	private final Deque<Entry> recent = new ArrayDeque<>();

	InquiryRateLimit(@Value("${app.inquiry.max-per-hour:0}") int maxPerHour,
			@Value("${app.inquiry.max-per-ip-per-hour:0}") int maxPerIpPerHour) {
		this.maxPerHour = maxPerHour;
		this.maxPerIpPerHour = maxPerIpPerHour;
	}

	/** 兩個上限都還有額度就記一筆並回 true */
	synchronized boolean tryAcquire(String ip) {
		if (maxPerHour <= 0 && maxPerIpPerHour <= 0) {
			return true;
		}
		Instant now = Instant.now();
		while (!recent.isEmpty() && recent.peekFirst().at().isBefore(now.minus(WINDOW))) {
			recent.pollFirst();
		}
		if (maxPerHour > 0 && recent.size() >= maxPerHour) {
			return false;
		}
		if (maxPerIpPerHour > 0 && recent.stream().filter(e -> e.ip().equals(ip)).count() >= maxPerIpPerHour) {
			return false;
		}
		recent.addLast(new Entry(now, ip));
		return true;
	}

}
