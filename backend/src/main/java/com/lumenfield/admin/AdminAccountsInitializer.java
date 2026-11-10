package com.lumenfield.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 啟動時依設定建立管理者帳號，密碼由環境變數提供、不進版控。
 * <ul>
 * <li>{@code app.admin.owner.*}：可讀寫的管理者（ADMIN）</li>
 * <li>{@code app.admin.viewer.*}：公開 demo 用的唯讀帳號（VIEWER）</li>
 * </ul>
 * 帳號或密碼沒設定就略過；帳號已存在則不動（不會覆蓋改過的密碼）。
 */
@Component
class AdminAccountsInitializer implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(AdminAccountsInitializer.class);

	private final AdminUserRepository admins;

	private final PasswordEncoder encoder;

	private final String ownerUsername;

	private final String ownerPassword;

	private final String viewerUsername;

	private final String viewerPassword;

	AdminAccountsInitializer(AdminUserRepository admins, PasswordEncoder encoder,
			@Value("${app.admin.owner.username:}") String ownerUsername,
			@Value("${app.admin.owner.password:}") String ownerPassword,
			@Value("${app.admin.viewer.username:}") String viewerUsername,
			@Value("${app.admin.viewer.password:}") String viewerPassword) {
		this.admins = admins;
		this.encoder = encoder;
		this.ownerUsername = ownerUsername;
		this.ownerPassword = ownerPassword;
		this.viewerUsername = viewerUsername;
		this.viewerPassword = viewerPassword;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		create(ownerUsername, ownerPassword, AdminRole.ADMIN);
		create(viewerUsername, viewerPassword, AdminRole.VIEWER);
	}

	private void create(String username, String password, AdminRole role) {
		if (username.isBlank() || password.isBlank() || admins.findByUsername(username).isPresent()) {
			return;
		}
		admins.save(new AdminUser(username, encoder.encode(password), role));
		log.info("Created {} account '{}'", role, username);
	}

}
