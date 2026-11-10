package com.lumenfield.project;

import com.lumenfield.common.CodedEnum;

/** 縣市，ISO 3166-2:TW（DATA_MODEL 3.5）；資料庫存 TW-CYQ 這種代碼。 */
public enum CountyCode implements CodedEnum {

	KEE, TPE, NWT, TAO, HSZ, HSQ, MIA, TXG, CHA, NAN, YUN,
	CYI, CYQ, TNN, KHH, PIF, ILA, HUA, TTT, PEN, KIN, LIE;

	@Override
	public String code() {
		return "TW-" + name();
	}

	/** 由 TW-CYQ 這種代碼找縣市；不存在回傳 empty */
	public static java.util.Optional<CountyCode> fromCode(String code) {
		return java.util.Arrays.stream(values()).filter(c -> c.code().equals(code)).findFirst();
	}

	@jakarta.persistence.Converter(autoApply = true)
	static class Converter extends CodedEnum.Converter<CountyCode> {

		Converter() {
			super(CountyCode.class);
		}

	}

}
