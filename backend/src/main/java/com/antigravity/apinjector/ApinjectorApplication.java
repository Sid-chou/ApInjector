package com.antigravity.apinjector;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ApinjectorApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApinjectorApplication.class, args);
	}

}
