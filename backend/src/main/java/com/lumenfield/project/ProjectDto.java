package com.lumenfield.project;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import com.lumenfield.category.Category;
import com.lumenfield.common.ImageDto;
import com.lumenfield.common.LocalizedText;

/** 對應前端 Project 型別（DATA_MODEL §6）；countyCode 輸出 TW-CYQ 這種代碼。 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProjectDto(Long id, String slug, LocalizedText title, LocalizedText description, int year,
		List<Long> categoryIds, LocalizedText location, String countyCode, BigDecimal latitude, BigDecimal longitude,
		List<ImageDto> images) {

	static ProjectDto from(Project p) {
		return new ProjectDto(p.getId(), p.getSlug(), p.getTitle(), p.getDescription(), p.getYear(),
				p.getCategories().stream().map(Category::getId).sorted().toList(), p.getLocation(),
				p.getCountyCode().code(), p.getLatitude(), p.getLongitude(),
				p.getImages().stream().map(i -> new ImageDto(i.getId(), i.getUrl(), i.getAlt(), i.getSortOrder())).toList());
	}

}
