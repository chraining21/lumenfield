package com.lumenfield.product;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** 前台公開 API；產品數量少（數十至數百款），列表直接回傳完整資料。 */
@RestController
@RequestMapping("/api/products")
class ProductController {

	private final ProductRepository products;

	ProductController(ProductRepository products) {
		this.products = products;
	}

	@GetMapping
	@Transactional(readOnly = true)
	List<ProductDto> list() {
		return products.findAll(Sort.by("id")).stream().map(ProductDto::publicView).toList();
	}

	@GetMapping("/{slug}")
	@Transactional(readOnly = true)
	ProductDto get(@PathVariable String slug) {
		return products.findBySlug(slug)
			.map(ProductDto::publicView)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
	}

}
