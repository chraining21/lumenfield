package com.lumenfield.project;

import java.time.Year;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.lumenfield.category.Category;
import com.lumenfield.category.CategoryRepository;
import com.lumenfield.category.CategoryType;

@Service
@Transactional
class AdminProjectService {

	private final ProjectRepository projects;

	private final CategoryRepository categories;

	AdminProjectService(ProjectRepository projects, CategoryRepository categories) {
		this.projects = projects;
		this.categories = categories;
	}

	@Transactional(readOnly = true)
	List<ProjectDto> list() {
		return projects.findAll(Sort.by(Sort.Order.desc("year"), Sort.Order.asc("id")))
			.stream()
			.map(ProjectDto::from)
			.toList();
	}

	@Transactional(readOnly = true)
	ProjectDto get(long id) {
		return ProjectDto.from(find(id));
	}

	ProjectDto create(ProjectRequest req) {
		checkUnique(req, null);
		Project p = new Project(req.slug(), req.title().toText(), req.year(), req.location().toText(), county(req));
		apply(p, req);
		return ProjectDto.from(projects.saveAndFlush(p));
	}

	ProjectDto update(long id, ProjectRequest req) {
		Project p = find(id);
		checkUnique(req, id);
		p.setSlug(req.slug());
		p.setTitle(req.title().toText());
		p.setYear(req.year());
		p.setLocation(req.location().toText());
		p.setCountyCode(county(req));
		apply(p, req);
		return ProjectDto.from(projects.saveAndFlush(p));
	}

	private Project find(long id) {
		return projects.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
	}

	private void checkUnique(ProjectRequest req, Long selfId) {
		projects.findBySlug(req.slug())
			.filter(other -> !Objects.equals(other.getId(), selfId))
			.ifPresent(other -> {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "slug");
			});
	}

	private static CountyCode county(ProjectRequest req) {
		return CountyCode.fromCode(req.countyCode())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown county code"));
	}

	private void apply(Project p, ProjectRequest req) {
		int nextYear = Year.now(ZoneId.of("Asia/Taipei")).getValue() + 1;
		if (req.year() > nextYear) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Year must be " + nextYear + " or earlier");
		}
		p.setDescription(req.description() == null ? null : req.description().toTextOrNull());
		p.setCoordinates(req.latitude(), req.longitude());

		List<Category> found = categories.findAllById(Set.copyOf(req.categoryIds()));
		if (found.size() != Set.copyOf(req.categoryIds()).size()
				|| found.stream().anyMatch(c -> c.getType() != CategoryType.PROJECT)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category");
		}
		p.getCategories().clear();
		p.getCategories().addAll(found);

		// 照片整批取代；順序就是送來的順序，第一張為封面
		// TODO: 移除的照片仍留在上傳資料夾，日後再做清理
		p.getImages().clear();
		for (int i = 0; i < req.images().size(); i++) {
			p.addImage(new ProjectImage(req.images().get(i).url(), i + 1));
		}
	}

}
