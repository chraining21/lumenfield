package com.lumenfield.project;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/projects")
class ProjectController {

	private final ProjectRepository projects;

	ProjectController(ProjectRepository projects) {
		this.projects = projects;
	}

	/** 年份新到舊 */
	@GetMapping
	@Transactional(readOnly = true)
	List<ProjectDto> list() {
		return projects.findAll(Sort.by(Sort.Order.desc("year"), Sort.Order.asc("id")))
			.stream()
			.map(ProjectDto::from)
			.toList();
	}

	@GetMapping("/{slug}")
	@Transactional(readOnly = true)
	ProjectDto get(@PathVariable String slug) {
		return projects.findBySlug(slug)
			.map(ProjectDto::from)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
	}

}
