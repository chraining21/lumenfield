package com.lumenfield.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/** 對應前端 Image 型別（DATA_MODEL §6）。 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ImageDto(Long id, String url, LocalizedText alt, int sortOrder) {
}
