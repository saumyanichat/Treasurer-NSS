package com.nss.treasurer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TreasurerApplication {

	public static void main(String[] args) {
		SpringApplication.run(TreasurerApplication.class, args);
	}

}
