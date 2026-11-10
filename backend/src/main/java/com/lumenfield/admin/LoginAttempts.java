package com.lumenfield.admin;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * 登入失敗次數限制（ADR-001 §6）：同一 IP 對同一帳號連續失敗 5 次鎖 15 分鐘。
 * <p>
 * 依「IP＋帳號」計數：只依帳號的話，任何人故意輸錯就能把管理者鎖在門外。IP 由 Next 以 X-Client-IP
 * 轉來（見 InternalTokenFilter）。存在記憶體，重啟後歸零；只有一台後端時足夠，日後多台再改放資料庫或 Redis。
 */
@Component
class LoginAttempts {

	static final int MAX_FAILURES = 5;

	static final Duration LOCK = Duration.ofMinutes(15);

	/** 超過這個數量就清掉沒在鎖定中的紀錄，避免換很多 IP 嘗試時記憶體一直長大 */
	private static final int PRUNE_ABOVE = 10_000;

	private record State(int failures, Instant lockedUntil) {
	}

	private final ConcurrentHashMap<String, State> states = new ConcurrentHashMap<>();

	boolean isLocked(String ip, String username) {
		State s = states.get(key(ip, username));
		return s != null && s.lockedUntil() != null && Instant.now().isBefore(s.lockedUntil());
	}

	void failed(String ip, String username) {
		if (states.size() > PRUNE_ABOVE) {
			Instant now = Instant.now();
			states.values().removeIf(s -> s.lockedUntil() == null || now.isAfter(s.lockedUntil()));
		}
		states.compute(key(ip, username), (k, s) -> {
			int failures = (s == null || s.lockedUntil() != null ? 0 : s.failures()) + 1;
			return failures >= MAX_FAILURES ? new State(failures, Instant.now().plus(LOCK)) : new State(failures, null);
		});
	}

	void succeeded(String ip, String username) {
		states.remove(key(ip, username));
	}

	private static String key(String ip, String username) {
		return ip + "|" + username.strip().toLowerCase(Locale.ROOT);
	}

}
