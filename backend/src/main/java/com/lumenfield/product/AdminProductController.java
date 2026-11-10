package com.lumenfield.product;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 後台產品管理（需登入）；SPEC §8：新增、修改。 */
@RestController
@RequestMapping("/api/admin/products")
class AdminProductController {

	private final AdminProductService service;

	AdminProductController(AdminProductService service) {
		this.service = service;
	}

	@GetMapping
	List<ProductDto> list() {
		return service.list();
	}

	@GetMapping("/{id}")
	ProductDto get(@PathVariable long id) {
		return service.get(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	ProductDto create(@Validated @RequestBody ProductRequest request) {
		return service.create(request);
	}

	@PutMapping("/{id}")
	ProductDto update(@PathVariable long id, @Validated @RequestBody ProductRequest request) {
		return service.update(id, request);
	}

}
