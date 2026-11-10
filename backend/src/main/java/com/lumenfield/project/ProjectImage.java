package com.lumenfield.project;

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

@Entity
public class ProjectImage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "project_id")
	private Project project;

	@Column(nullable = false, length = 1000)
	private String url;

	@Embedded
	@AttributeOverride(name = "zh", column = @Column(name = "alt_zh", length = 300))
	@AttributeOverride(name = "en", column = @Column(name = "alt_en", length = 300))
	private LocalizedText alt;

	@Column(nullable = false)
	private int sortOrder;

	protected ProjectImage() {
	}

	public ProjectImage(String url, int sortOrder) {
		this.url = url;
		this.sortOrder = sortOrder;
	}

	public Long getId() {
		return id;
	}

	public Project getProject() {
		return project;
	}

	void setProject(Project project) {
		this.project = project;
	}

	public String getUrl() {
		return url;
	}

	public LocalizedText getAlt() {
		return alt;
	}

	public void setAlt(LocalizedText alt) {
		this.alt = alt;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

}
