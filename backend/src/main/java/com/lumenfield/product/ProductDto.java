package com.lumenfield.product;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import com.lumenfield.category.Category;
import com.lumenfield.common.ImageDto;
import com.lumenfield.common.LocalizedText;

/** 對應前端 Product 型別（DATA_MODEL §6）。 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProductDto(Long id, String slug, String modelNo, LocalizedText name, String wattage,
		String colorTemperature, String dimensions, String ipRating, BigDecimal price, boolean priceVisible,
		List<Long> categoryIds, List<ImageDto> images, List<ImageDto> applicationImages, List<FileDto> files) {

	@JsonInclude(JsonInclude.Include.NON_NULL)
	public record FileDto(Long id, ProductFileKind kind, String url, String fileName, Long sizeBytes) {
	}

	/** 公開用：價格不公開時不輸出 price，避免從 API 看到 */
	static ProductDto publicView(Product p) {
		return of(p, p.isPriceVisible() ? p.getPrice() : null);
	}

	/** 後台用：一律輸出價格 */
	static ProductDto adminView(Product p) {
		return of(p, p.getPrice());
	}

	private static ProductDto of(Product p, BigDecimal price) {
		return new ProductDto(p.getId(), p.getSlug(), p.getModelNo(), p.getName(), p.getWattage(),
				p.getColorTemperature(), p.getDimensions(), p.getIpRating(), price, p.isPriceVisible(),
				p.getCategories().stream().map(Category::getId).sorted().toList(), images(p.getProductImages()),
				images(p.getApplicationImages()),
				p.getFiles()
					.stream()
					.map(f -> new FileDto(f.getId(), f.getKind(), f.getUrl(), f.getFileName(), f.getSizeBytes()))
					.toList());
	}

	private static List<ImageDto> images(List<ProductImage> list) {
		return list.stream().map(i -> new ImageDto(i.getId(), i.getUrl(), i.getAlt(), i.getSortOrder())).toList();
	}

}
