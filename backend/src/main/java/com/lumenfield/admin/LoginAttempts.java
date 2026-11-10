package com.lumenfield.admin;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * 登入失敗次數限制（ADR-001 §6）：同一帳號連續失敗 5 次鎖 15 分鐘。
 * <p>
 * 依帳號計數：請求都經過 Next 伺服器，後端看不到客人的真實 IP。存在記憶體，重啟後歸零；
 * 只有一台後端時足夠，日後多台再改放資料庫或 Redis。
 */
@Component
class LoginAttempts {

	static final int MAX_FAILURES = 5;

	static final Duration LOCK = Duration.ofMinutes(15);

	private record State(int failures, Instant lockedUntil) {
	}

	private final ConcurrentHashMap<String, State> states = new ConcurrentHashMap<>();

	boolean isLocked(String username) {
		State s = states.get(key(username));
		return s != null && s.lockedUntil() != null && Instant.now().isBefore(s.lockedUntil());
	}

	void failed(String username) {
		states.compute(key(username), (k, s) -> {
			int failures = (s == null || s.lockedUntil() != null ? 0 : s.failures()) + 1;
			return failures >= MAX_FAILURES ? new State(failures, Instant.now().plus(LOCK)) : new State(failures, null);
		});
	}

	void succeeded(String username) {
		states.remove(key(username));
	}

	private static String key(String username) {
		return username.strip().toLowerCase(Locale.ROOT);
	}

}
