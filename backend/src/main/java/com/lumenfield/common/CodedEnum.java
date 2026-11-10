package com.lumenfield.common;

import java.util.Arrays;

import jakarta.persistence.AttributeConverter;

/** 資料庫存的代碼和 Java 列舉名稱不同時使用（如縣市 TW-CYQ、語系 zh）。 */
public interface CodedEnum {

	String code();

	abstract class Converter<E extends Enum<E> & CodedEnum> implements AttributeConverter<E, String> {

		private final Class<E> type;

		protected Converter(Class<E> type) {
			this.type = type;
		}

		@Override
		public String convertToDatabaseColumn(E value) {
			return value == null ? null : value.code();
		}

		@Override
		public E convertToEntityAttribute(String code) {
			if (code == null) {
				return null;
			}
			return Arrays.stream(type.getEnumConstants())
				.filter(e -> e.code().equals(code))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Unknown " + type.getSimpleName() + " code: " + code));
		}

	}

}
