package com.lumenfield.project;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.lumenfield.common.LocalizedText;

/** 後台新增／修改案例：整份送出，照片、分類整批取代。規則與後台表單一致。 */
public record ProjectRequest(
		@NotBlank @Size(max = 150) @Pattern(regexp = "[a-z0-9]+(-[a-z0-9]+)*") String slug,
		@NotNull @Valid Text title,
		@Valid Description description,
		// 上限（明年）在服務層依當下日期檢查
		@Min(1993) int year,
		@NotNull @Valid Text location,
		@NotBlank String countyCode,
		@DecimalMin("21.5") @DecimalMax("26.5") BigDecimal latitude,
		@DecimalMin("118") @DecimalMax("122.5") BigDecimal longitude,
		@NotNull @Size(max = 20) List<@NotNull Long> categoryIds,
		// 前台列表用第一張當封面，至少要一張
		@NotEmpty @Size(max = 50) List<@Valid ImageInput> images) {

	public record Text(@NotBlank @Size(max = 200) String zh, @NotBlank @Size(max = 200) String en) {

		LocalizedText toText() {
			return new LocalizedText(zh.strip(), en.strip());
		}

	}

	/** 說明可以不填，但中英文要一起填 */
	public record Description(@Size(max = 10_000) String zh, @Size(max = 10_000) String en) {

		@AssertTrue(message = "description zh and en must both be filled or both empty")
		boolean isBothOrNeither() {
			return isBlank(zh) == isBlank(en);
		}

		LocalizedText toTextOrNull() {
			return isBlank(zh) ? null : new LocalizedText(zh.strip(), en.strip());
		}

		private static boolean isBlank(String s) {
			return s == null || s.isBlank();
		}

	}

	public record ImageInput(@NotBlank @Size(max = 1000) @Pattern(regexp = "(/(?!/)|https?://)\\S*") String url) {
	}

	@AssertTrue(message = "latitude and longitude must both be filled or both empty")
	boolean isCoordinatesBothOrNeither() {
		return (latitude == null) == (longitude == null);
	}

}
