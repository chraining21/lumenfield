package com.lumenfield;

import org.springframework.boot.SpringApplication;

// 不用 compose.yaml、改用 Testcontainers 啟動整個應用程式（IDE 直接執行這支）
public class TestLightBackendApplication {

	public static void main(String[] args) {
		SpringApplication.from(LightBackendApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
