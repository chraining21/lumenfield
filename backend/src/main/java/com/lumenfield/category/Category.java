package com.lumenfield.category;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import com.lumenfield.common.LocalizedText;
import com.lumenfield.common.TimestampedEntity;

@Entity
public class Category extends TimestampedEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private CategoryType type;

	@Column(nullable = false, length = 100)
	private String slug;

	@Embedded
	@AttributeOverride(name = "zh", column = @Column(name = "name_zh", nullable = false, length = 100))
	@AttributeOverride(name = "en", column = @Column(name = "name_en", nullable = false, length = 100))
	private LocalizedText name;

	@Column(nullable = false)
	private int sortOrder;

	protected Category() {
	}

	public Category(CategoryType type, String slug, LocalizedText name, int sortOrder) {
		this.type = type;
		this.slug = slug;
		this.name = name;
		this.sortOrder = sortOrder;
	}

	public Long getId() {
		return id;
	}

	public CategoryType getType() {
		return type;
	}

	public String getSlug() {
		return slug;
	}

	public LocalizedText getName() {
		return name;
	}

	public void setName(LocalizedText name) {
		this.name = name;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

}
