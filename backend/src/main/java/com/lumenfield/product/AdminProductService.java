package com.lumenfield.product;

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
class AdminProductService {

	/** 產品只能掛燈型與空間分類 */
	private static final Set<CategoryType> PRODUCT_CATEGORY_TYPES = Set.of(CategoryType.LIGHT_TYPE, CategoryType.SPACE);

	private final ProductRepository products;

	private final CategoryRepository categories;

	AdminProductService(ProductRepository products, CategoryRepository categories) {
		this.products = products;
		this.categories = categories;
	}

	@Transactional(readOnly = true)
	List<ProductDto> list() {
		return products.findAll(Sort.by("id")).stream().map(ProductDto::adminView).toList();
	}

	@Transactional(readOnly = true)
	ProductDto get(long id) {
		return ProductDto.adminView(find(id));
	}

	ProductDto create(ProductRequest req) {
		checkUnique(req, null);
		Product p = new Product(req.slug(), req.modelNo().strip(), req.name().toText());
		apply(p, req);
		return ProductDto.adminView(products.saveAndFlush(p));
	}

	ProductDto update(long id, ProductRequest req) {
		Product p = find(id);
		checkUnique(req, id);
		p.setSlug(req.slug());
		p.setModelNo(req.modelNo().strip());
		p.setName(req.name().toText());
		apply(p, req);
		return ProductDto.adminView(products.saveAndFlush(p));
	}

	private Product find(long id) {
		return products.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
	}

	/** 網址代稱、型號不可與其他產品重複；409 的 detail 帶欄位名稱讓前端標示 */
	private void checkUnique(ProductRequest req, Long selfId) {
		products.findBySlug(req.slug())
			.filter(other -> !Objects.equals(other.getId(), selfId))
			.ifPresent(other -> {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "slug");
			});
		products.findByModelNo(req.modelNo().strip())
			.filter(other -> !Objects.equals(other.getId(), selfId))
			.ifPresent(other -> {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "modelNo");
			});
	}

	private void apply(Product p, ProductRequest req) {
		p.setWattage(blankToNull(req.wattage()));
		p.setColorTemperature(blankToNull(req.colorTemperature()));
		p.setDimensions(blankToNull(req.dimensions()));
		p.setIpRating(blankToNull(req.ipRating()));
		p.setPrice(req.price());
		p.setPriceVisible(req.priceVisible());

		List<Category> found = categories.findAllById(Set.copyOf(req.categoryIds()));
		if (found.size() != Set.copyOf(req.categoryIds()).size()
				|| found.stream().anyMatch(c -> !PRODUCT_CATEGORY_TYPES.contains(c.getType()))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category");
		}
		p.getCategories().clear();
		p.getCategories().addAll(found);

		// 照片、檔案整批取代；順序就是送來的順序
		// TODO: 移除的照片／檔案仍留在上傳資料夾，日後再做清理
		p.getImages().clear();
		for (int i = 0; i < req.images().size(); i++) {
			p.addImage(new ProductImage(ProductImageKind.PRODUCT, req.images().get(i).url(), i + 1));
		}
		for (int i = 0; i < req.applicationImages().size(); i++) {
			p.addImage(new ProductImage(ProductImageKind.APPLICATION, req.applicationImages().get(i).url(), i + 1));
		}
		p.getFiles().clear();
		req.files().forEach(f -> p.addFile(new ProductFile(f.kind(), f.url(), f.fileName().strip(), f.sizeBytes())));
	}

	private static String blankToNull(String s) {
		return s == null || s.isBlank() ? null : s.strip();
	}

}
