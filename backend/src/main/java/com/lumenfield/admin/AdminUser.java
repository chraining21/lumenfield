package com.lumenfield.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import com.lumenfield.common.TimestampedEntity;

/** 後台管理者；密碼只存 BCrypt 雜湊。TODO: 帳號數量與權限細節待討論（DATA_MODEL 3.8） */
@Entity
public class AdminUser extends TimestampedEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 50)
	private String username;

	@Column(nullable = false, length = 100)
	private String passwordHash;

	protected AdminUser() {
	}

	public AdminUser(String username, String passwordHash) {
		this.username = username;
		this.passwordHash = passwordHash;
	}

	public Long getId() {
		return id;
	}

	public String getUsername() {
		return username;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

}
