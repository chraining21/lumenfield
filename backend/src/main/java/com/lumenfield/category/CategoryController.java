package com.lumenfield.category;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
class CategoryController {

	private final CategoryRepository categories;

	CategoryController(CategoryRepository categories) {
		this.categories = categories;
	}

	@GetMapping
	@Transactional(readOnly = true)
	List<CategoryDto> list() {
		return categories.findAll(Sort.by("type", "sortOrder", "id")).stream().map(CategoryDto::from).toList();
	}

}
