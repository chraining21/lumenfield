package com.lumenfield.product;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import com.lumenfield.category.Category;
import com.lumenfield.common.LocalizedText;
import com.lumenfield.common.TimestampedEntity;

@Entity
public class Product extends TimestampedEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 100)
	private String slug;

	@Column(nullable = false, length = 50)
	private String modelNo;

	@Embedded
	@AttributeOverride(name = "zh", column = @Column(name = "name_zh", nullable = false, length = 200))
	@AttributeOverride(name = "en", column = @Column(name = "name_en", nullable = false, length = 200))
	private LocalizedText name;

	// 規格先用字串：同一型號常有多種瓦數／色溫（DATA_MODEL 3.2）
	@Column(length = 100)
	private String wattage;

	@Column(length = 100)
	private String colorTemperature;

	@Column(length = 100)
	private String dimensions;

	@Column(length = 20)
	private String ipRating;

	@Column(precision = 12, scale = 2)
	private BigDecimal price;

	/** false 時前台顯示「詢價」 */
	@Column(nullable = false)
	private boolean priceVisible;

	@ManyToMany
	@JoinTable(name = "product_category", joinColumns = @JoinColumn(name = "product_id"),
			inverseJoinColumns = @JoinColumn(name = "category_id"))
	private Set<Category> categories = new LinkedHashSet<>();

	/** 產品圖與應用照片放在同一張表，用 kind 區分；讀取用 getProductImages() / getApplicationImages() */
	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortOrder")
	private List<ProductImage> images = new ArrayList<>();

	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("id")
	private List<ProductFile> files = new ArrayList<>();

	protected Product() {
	}

	public Product(String slug, String modelNo, LocalizedText name) {
		this.slug = slug;
		this.modelNo = modelNo;
		this.name = name;
	}

	public void addImage(ProductImage image) {
		image.setProduct(this);
		images.add(image);
	}

	public void addFile(ProductFile file) {
		file.setProduct(this);
		files.add(file);
	}

	public Long getId() {
		return id;
	}

	public String getSlug() {
		return slug;
	}

	public void setSlug(String slug) {
		this.slug = slug;
	}

	public String getModelNo() {
		return modelNo;
	}

	public void setModelNo(String modelNo) {
		this.modelNo = modelNo;
	}

	public LocalizedText getName() {
		return name;
	}

	public void setName(LocalizedText name) {
		this.name = name;
	}

	public String getWattage() {
		return wattage;
	}

	public void setWattage(String wattage) {
		this.wattage = wattage;
	}

	public String getColorTemperature() {
		return colorTemperature;
	}

	public void setColorTemperature(String colorTemperature) {
		this.colorTemperature = colorTemperature;
	}

	public String getDimensions() {
		return dimensions;
	}

	public void setDimensions(String dimensions) {
		this.dimensions = dimensions;
	}

	public String getIpRating() {
		return ipRating;
	}

	public void setIpRating(String ipRating) {
		this.ipRating = ipRating;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public boolean isPriceVisible() {
		return priceVisible;
	}

	public void setPriceVisible(boolean priceVisible) {
		this.priceVisible = priceVisible;
	}

	public Set<Category> getCategories() {
		return categories;
	}

	public List<ProductImage> getImages() {
		return images;
	}

	/** 產品圖，第一張為主圖 */
	public List<ProductImage> getProductImages() {
		return imagesOf(ProductImageKind.PRODUCT);
	}

	public List<ProductImage> getApplicationImages() {
		return imagesOf(ProductImageKind.APPLICATION);
	}

	private List<ProductImage> imagesOf(ProductImageKind kind) {
		return images.stream()
			.filter(i -> i.getKind() == kind)
			.sorted(Comparator.comparingInt(ProductImage::getSortOrder))
			.toList();
	}

	public List<ProductFile> getFiles() {
		return files;
	}

}
