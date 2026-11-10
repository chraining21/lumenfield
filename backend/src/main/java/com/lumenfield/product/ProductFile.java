package com.lumenfield.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class ProductFile {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id")
	private Product product;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private ProductFileKind kind;

	@Column(nullable = false, length = 1000)
	private String url;

	@Column(nullable = false)
	private String fileName;

	private Long sizeBytes;

	protected ProductFile() {
	}

	public ProductFile(ProductFileKind kind, String url, String fileName, Long sizeBytes) {
		this.kind = kind;
		this.url = url;
		this.fileName = fileName;
		this.sizeBytes = sizeBytes;
	}

	public Long getId() {
		return id;
	}

	public Product getProduct() {
		return product;
	}

	void setProduct(Product product) {
		this.product = product;
	}

	public ProductFileKind getKind() {
		return kind;
	}

	public String getUrl() {
		return url;
	}

	public String getFileName() {
		return fileName;
	}

	public Long getSizeBytes() {
		return sizeBytes;
	}

}
