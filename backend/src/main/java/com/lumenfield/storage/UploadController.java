package com.lumenfield.storage;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/** 後台上傳（需登入，/api/admin/**）。只收白名單內的副檔名，照片另外檢查檔頭。 */
@RestController
@RequestMapping("/api/admin/uploads")
class UploadController {

	static final long MAX_IMAGE_BYTES = 10L * 1024 * 1024;

	static final long MAX_FILE_BYTES = 50L * 1024 * 1024;

	static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

	/** 型錄 PDF、IES／LDT 配光檔、CAD 圖檔 */
	static final Set<String> FILE_EXTENSIONS = Set.of("pdf", "ies", "ldt", "dwg", "dxf", "zip");

	private static final Map<String, byte[][]> IMAGE_SIGNATURES = Map.of(
			"jpg", new byte[][] { { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF } },
			"jpeg", new byte[][] { { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF } },
			"png", new byte[][] { { (byte) 0x89, 'P', 'N', 'G' } },
			"webp", new byte[][] { { 'R', 'I', 'F', 'F' } });

	/** WebP 是 RIFF 容器，第 8～11 byte 另外要是 "WEBP"（不然可能是 WAV、AVI） */
	private static final byte[] WEBP_FORMAT = { 'W', 'E', 'B', 'P' };

	private final FileStorage storage;

	UploadController(FileStorage storage) {
		this.storage = storage;
	}

	record Uploaded(String url, String fileName, long sizeBytes) {
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	Uploaded upload(@RequestParam MultipartFile file, @RequestParam String type) throws IOException {
		boolean image = switch (type) {
			case "image" -> true;
			case "file" -> false;
			default -> throw bad("type must be image or file");
		};
		String fileName = StringUtils.cleanPath(String.valueOf(file.getOriginalFilename()));
		String ext = String.valueOf(StringUtils.getFilenameExtension(fileName)).toLowerCase(Locale.ROOT);
		if (file.isEmpty()) {
			throw bad("Empty file");
		}
		if (!(image ? IMAGE_EXTENSIONS : FILE_EXTENSIONS).contains(ext)) {
			throw bad("File type not allowed: " + ext);
		}
		if (file.getSize() > (image ? MAX_IMAGE_BYTES : MAX_FILE_BYTES)) {
			throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "File too large");
		}
		if (image && !hasSignature(file, ext)) {
			throw bad("Not a valid " + ext + " image");
		}
		try (InputStream in = file.getInputStream()) {
			String key = storage.store(in, ext);
			return new Uploaded("/files/" + key, fileName, file.getSize());
		}
	}

	private static boolean hasSignature(MultipartFile file, String ext) throws IOException {
		try (InputStream in = file.getInputStream()) {
			byte[] head = in.readNBytes(12);
			boolean signature = Arrays.stream(IMAGE_SIGNATURES.get(ext))
				.anyMatch(sig -> head.length >= sig.length && Arrays.equals(head, 0, sig.length, sig, 0, sig.length));
			if (!ext.equals("webp")) {
				return signature;
			}
			return signature && head.length == 12 && Arrays.equals(head, 8, 12, WEBP_FORMAT, 0, 4);
		}
	}

	private static ResponseStatusException bad(String reason) {
		return new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
	}

}
