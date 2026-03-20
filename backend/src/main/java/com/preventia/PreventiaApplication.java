package com.preventia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PreventiaApplication {

    public static void main(String[] args) {
        SpringApplication.run(PreventiaApplication.class, args);
    }
}
