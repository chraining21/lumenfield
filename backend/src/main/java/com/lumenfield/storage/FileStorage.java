package com.lumenfield.storage;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

import org.springframework.core.io.Resource;

/**
 * 上傳檔案的存放處。目前存在後端主機的資料夾（{@link LocalFileStorage}）；
 * 部署時若改放雲端（R2、S3），換一個實作即可，資料庫裡的網址格式不變。
 */
public interface FileStorage {

	/** 存檔並回傳 key（如 2026/11/uuid.jpg），對外網址為 /files/{key} */
	String store(InputStream content, String extension) throws IOException;

	Optional<Resource> load(String key);

}
