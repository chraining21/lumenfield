package com.lumenfield.common;

import jakarta.persistence.Embeddable;

/**
 * 雙語文字（DATA_MODEL §1）。資料表展開為 xxx_zh / xxx_en 兩欄，
 * 欄位名稱由使用處以 @AttributeOverride 指定。
 */
@Embeddable
public record LocalizedText(String zh, String en) {
}
