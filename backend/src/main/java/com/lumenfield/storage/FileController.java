package com.lumenfield.storage;

import java.time.Duration;

import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * 公開下載上傳的照片與檔案。前台以 /files/** 轉到這裡（Next rewrites），瀏覽器不直接連後端。
 * 檔名是 UUID、內容不會變，可以長期快取。
 */
@RestController
class FileController {

	private final FileStorage storage;

	FileController(FileStorage storage) {
		this.storage = storage;
	}

	@GetMapping("/api/files/{year}/{month}/{name}")
	ResponseEntity<Resource> get(@PathVariable String year, @PathVariable String month, @PathVariable String name) {
		Resource file = storage.load(year + "/" + month + "/" + name)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		return ResponseEntity.ok()
			.contentType(MediaTypeFactory.getMediaType(name).orElse(MediaType.APPLICATION_OCTET_STREAM))
			.cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
			.body(file);
	}

}
