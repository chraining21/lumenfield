package com.lumenfield.category;

import com.lumenfield.common.LocalizedText;

public record CategoryDto(Long id, CategoryType type, String slug, LocalizedText name, int sortOrder) {

	static CategoryDto from(Category c) {
		return new CategoryDto(c.getId(), c.getType(), c.getSlug(), c.getName(), c.getSortOrder());
	}

}
