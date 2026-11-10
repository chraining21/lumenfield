package com.lumenfield.inquiry;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import com.lumenfield.common.LocalizedText;
import com.lumenfield.product.Product;

/** 詢價項目：型號、名稱是送出當下的快照，之後改產品不影響（DATA_MODEL §1 第 5 點）。 */
@Entity
public class InquiryItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "inquiry_id")
	private Inquiry inquiry;

	/** 產品刪除後為 null（資料表 ON DELETE SET NULL） */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id")
	private Product product;

	@Column(nullable = false, length = 50)
	private String modelNoSnapshot;

	@Embedded
	@AttributeOverride(name = "zh", column = @Column(name = "product_name_snapshot_zh", nullable = false, length = 200))
	@AttributeOverride(name = "en", column = @Column(name = "product_name_snapshot_en", nullable = false, length = 200))
	private LocalizedText productNameSnapshot;

	@Column(nullable = false)
	private int quantity;

	protected InquiryItem() {
	}

	/** 由產品目前的型號與名稱建立快照 */
	public static InquiryItem snapshotOf(Product product, int quantity) {
		InquiryItem item = new InquiryItem();
		item.product = product;
		item.modelNoSnapshot = product.getModelNo();
		item.productNameSnapshot = product.getName();
		item.quantity = quantity;
		return item;
	}

	public Long getId() {
		return id;
	}

	public Inquiry getInquiry() {
		return inquiry;
	}

	void setInquiry(Inquiry inquiry) {
		this.inquiry = inquiry;
	}

	public Product getProduct() {
		return product;
	}

	public String getModelNoSnapshot() {
		return modelNoSnapshot;
	}

	public LocalizedText getProductNameSnapshot() {
		return productNameSnapshot;
	}

	public int getQuantity() {
		return quantity;
	}

}
