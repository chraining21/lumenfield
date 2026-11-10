package com.lumenfield.project;

import java.math.BigDecimal;
import java.util.ArrayList;
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
public class Project extends TimestampedEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 150)
	private String slug;

	@Embedded
	@AttributeOverride(name = "zh", column = @Column(name = "title_zh", nullable = false, length = 200))
	@AttributeOverride(name = "en", column = @Column(name = "title_en", nullable = false, length = 200))
	private LocalizedText title;

	@Embedded
	@AttributeOverride(name = "zh", column = @Column(name = "description_zh", columnDefinition = "TEXT"))
	@AttributeOverride(name = "en", column = @Column(name = "description_en", columnDefinition = "TEXT"))
	private LocalizedText description;

	@Column(nullable = false)
	private int year;

	@Embedded
	@AttributeOverride(name = "zh", column = @Column(name = "location_zh", nullable = false, length = 200))
	@AttributeOverride(name = "en", column = @Column(name = "location_en", nullable = false, length = 200))
	private LocalizedText location;

	@Column(nullable = false, length = 6)
	private CountyCode countyCode;

	// 經緯度選填，要一起填（資料表有 CHECK）；有填才在前台地圖畫光點
	@Column(precision = 9, scale = 6)
	private BigDecimal latitude;

	@Column(precision = 9, scale = 6)
	private BigDecimal longitude;

	@ManyToMany
	@JoinTable(name = "project_category", joinColumns = @JoinColumn(name = "project_id"),
			inverseJoinColumns = @JoinColumn(name = "category_id"))
	private Set<Category> categories = new LinkedHashSet<>();

	/** 第一張為封面 */
	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("sortOrder")
	private List<ProjectImage> images = new ArrayList<>();

	protected Project() {
	}

	public Project(String slug, LocalizedText title, int year, LocalizedText location, CountyCode countyCode) {
		this.slug = slug;
		this.title = title;
		this.year = year;
		this.location = location;
		this.countyCode = countyCode;
	}

	public void addImage(ProjectImage image) {
		image.setProject(this);
		images.add(image);
	}

	public void setCoordinates(BigDecimal latitude, BigDecimal longitude) {
		this.latitude = latitude;
		this.longitude = longitude;
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

	public LocalizedText getTitle() {
		return title;
	}

	public void setTitle(LocalizedText title) {
		this.title = title;
	}

	public LocalizedText getDescription() {
		return description;
	}

	public void setDescription(LocalizedText description) {
		this.description = description;
	}

	public int getYear() {
		return year;
	}

	public void setYear(int year) {
		this.year = year;
	}

	public LocalizedText getLocation() {
		return location;
	}

	public void setLocation(LocalizedText location) {
		this.location = location;
	}

	public CountyCode getCountyCode() {
		return countyCode;
	}

	public void setCountyCode(CountyCode countyCode) {
		this.countyCode = countyCode;
	}

	public BigDecimal getLatitude() {
		return latitude;
	}

	public BigDecimal getLongitude() {
		return longitude;
	}

	public Set<Category> getCategories() {
		return categories;
	}

	public List<ProjectImage> getImages() {
		return images;
	}

}
