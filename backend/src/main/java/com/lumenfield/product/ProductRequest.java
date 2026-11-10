package com.lumenfield.product;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.lumenfield.common.LocalizedText;

/** 後台新增／修改產品：整份送出，照片、檔案、分類整批取代。規則與後台表單一致。 */
public record ProductRequest(
		@NotBlank @Size(max = 100) @Pattern(regexp = SLUG) String slug,
		@NotBlank @Size(max = 50) String modelNo,
		@NotNull @Valid Name name,
		@Size(max = 100) String wattage,
		@Size(max = 100) String colorTemperature,
		@Size(max = 100) String dimensions,
		@Size(max = 20) String ipRating,
		@PositiveOrZero @Digits(integer = 10, fraction = 0) BigDecimal price,
		boolean priceVisible,
		@NotNull @Size(max = 20) List<@NotNull Long> categoryIds,
		@NotNull @Size(max = 30) List<@Valid ImageInput> images,
		@NotNull @Size(max = 30) List<@Valid ImageInput> applicationImages,
		@NotNull @Size(max = 30) List<@Valid FileInput> files) {

	static final String SLUG = "[a-z0-9]+(-[a-z0-9]+)*";

	/** 只接受站內路徑或 http(s)，擋掉 javascript: 之類會在連結上執行的網址 */
	static final String URL = "(/(?!/)|https?://)\\S*";

	public record Name(@NotBlank @Size(max = 200) String zh, @NotBlank @Size(max = 200) String en) {

		LocalizedText toText() {
			return new LocalizedText(zh.strip(), en.strip());
		}

	}

	public record ImageInput(@NotBlank @Size(max = 1000) @Pattern(regexp = URL) String url) {
	}

	public record FileInput(@NotNull ProductFileKind kind, @NotBlank @Size(max = 1000) @Pattern(regexp = URL) String url,
			@NotBlank @Size(max = 255) String fileName, @PositiveOrZero Long sizeBytes) {
	}

	@AssertTrue(message = "price is required when priceVisible")
	boolean isPriceGivenWhenVisible() {
		return !priceVisible || price != null;
	}

}
