package com.lumenfield.project;

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

/** 後台案例管理（需登入）；SPEC §8：新增、修改。 */
@RestController
@RequestMapping("/api/admin/projects")
class AdminProjectController {

	private final AdminProjectService service;

	AdminProjectController(AdminProjectService service) {
		this.service = service;
	}

	@GetMapping
	List<ProjectDto> list() {
		return service.list();
	}

	@GetMapping("/{id}")
	ProjectDto get(@PathVariable long id) {
		return service.get(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	ProjectDto create(@Validated @RequestBody ProjectRequest request) {
		return service.create(request);
	}

	@PutMapping("/{id}")
	ProjectDto update(@PathVariable long id, @Validated @RequestBody ProjectRequest request) {
		return service.update(id, request);
	}

}
