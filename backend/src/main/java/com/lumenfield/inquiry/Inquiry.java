package com.lumenfield.inquiry;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import com.lumenfield.common.TimestampedEntity;

// TODO: 聯絡欄位待確認（DATA_MODEL §7）
@Entity
public class Inquiry extends TimestampedEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** 對外編號，如 INQ-20261103-0001 */
	@Column(nullable = false, length = 30)
	private String inquiryNo;

	@Column(nullable = false, length = 100)
	private String contactName;

	@Column(length = 200)
	private String companyName;

	@Column(nullable = false, length = 254)
	private String email;

	@Column(length = 50)
	private String phone;

	@Column(columnDefinition = "TEXT")
	private String message;

	@Column(nullable = false, length = 2)
	private ContentLocale locale;

	@OneToMany(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("id")
	private List<InquiryItem> items = new ArrayList<>();

	protected Inquiry() {
	}

	public Inquiry(String inquiryNo, String contactName, String email, ContentLocale locale) {
		this.inquiryNo = inquiryNo;
		this.contactName = contactName;
		this.email = email;
		this.locale = locale;
	}

	public void addItem(InquiryItem item) {
		item.setInquiry(this);
		items.add(item);
	}

	public Long getId() {
		return id;
	}

	public String getInquiryNo() {
		return inquiryNo;
	}

	public String getContactName() {
		return contactName;
	}

	public String getCompanyName() {
		return companyName;
	}

	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}

	public String getEmail() {
		return email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public ContentLocale getLocale() {
		return locale;
	}

	public List<InquiryItem> getItems() {
		return items;
	}

}
