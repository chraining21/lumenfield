package com.lumenfield.product;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

	Optional<Product> findBySlug(String slug);

	Optional<Product> findByModelNo(String modelNo);

}
