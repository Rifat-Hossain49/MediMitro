package com.medimitra.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class MediMitraBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediMitraBackendApplication.class, args);
    }
}

