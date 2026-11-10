package com.lumenfield.inquiry;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import com.lumenfield.common.CodedEnum;

/** 客人送出詢價時的語系，回覆時用；資料庫存 zh／en。 */
public enum ContentLocale implements CodedEnum {

	ZH, EN;

	@Override
	@JsonValue
	public String code() {
		return name().toLowerCase();
	}

	/** JSON 收 zh／en */
	@JsonCreator
	public static ContentLocale fromCode(String code) {
		return Arrays.stream(values())
			.filter(l -> l.code().equals(code))
			.findFirst()
			.orElseThrow(() -> new IllegalArgumentException("Unknown locale: " + code));
	}

	@jakarta.persistence.Converter(autoApply = true)
	static class Converter extends CodedEnum.Converter<ContentLocale> {

		Converter() {
			super(ContentLocale.class);
		}

	}

}
