package com.lumenfield.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

/** 存在 app.upload-dir 底下，依年月分資料夾；檔名一律用 UUID，不用上傳者給的名稱。 */
@Component
class LocalFileStorage implements FileStorage {

	// 只接受自己產生的 key 格式，擋掉 ../ 之類的路徑穿越
	private static final Pattern KEY = Pattern.compile("\\d{4}/\\d{2}/[0-9a-f-]{36}\\.[a-z0-9]{1,5}");

	private final Path root;

	LocalFileStorage(@Value("${app.upload-dir}") Path root) throws IOException {
		this.root = Files.createDirectories(root.toAbsolutePath().normalize());
	}

	@Override
	public String store(InputStream content, String extension) throws IOException {
		LocalDate today = LocalDate.now(ZoneId.of("Asia/Taipei"));
		String key = "%d/%02d/%s.%s".formatted(today.getYear(), today.getMonthValue(), UUID.randomUUID(), extension);
		Path target = root.resolve(key);
		Files.createDirectories(target.getParent());
		Files.copy(content, target);
		return key;
	}

	@Override
	public Optional<Resource> load(String key) {
		if (!KEY.matcher(key).matches()) {
			return Optional.empty();
		}
		Path path = root.resolve(key).normalize();
		return path.startsWith(root) && Files.isRegularFile(path) ? Optional.of(new PathResource(path)) : Optional.empty();
	}

}
