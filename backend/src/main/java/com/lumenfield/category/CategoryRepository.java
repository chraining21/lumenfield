package com.lumenfield.category;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

	List<Category> findByTypeOrderBySortOrder(CategoryType type);

}
