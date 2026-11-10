package com.lumenfield.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import com.lumenfield.common.TimestampedEntity;

/** 後台管理者；密碼只存 BCrypt 雜湊。角色見 {@link AdminRole}。 */
@Entity
public class AdminUser extends TimestampedEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 50)
	private String username;

	@Column(nullable = false, length = 100)
	private String passwordHash;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private AdminRole role;

	protected AdminUser() {
	}

	public AdminUser(String username, String passwordHash) {
		this(username, passwordHash, AdminRole.ADMIN);
	}

	public AdminUser(String username, String passwordHash, AdminRole role) {
		this.username = username;
		this.passwordHash = passwordHash;
		this.role = role;
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

	public AdminRole getRole() {
		return role;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

}
