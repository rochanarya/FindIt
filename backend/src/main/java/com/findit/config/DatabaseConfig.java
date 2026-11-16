package com.findit.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
@Slf4j
public class DatabaseConfig {

    @Value("${spring.datasource.url:jdbc:h2:file:./findit_dev;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;NON_KEYWORDS=VALUE}")
    private String configuredUrl;

    @Value("${spring.datasource.username:sa}")
    private String configuredUsername;

    @Value("${spring.datasource.password:}")
    private String configuredPassword;

    @Value("${spring.datasource.driver-class-name:org.h2.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        String dbUrl = System.getenv("DB_URL");

        HikariConfig config = new HikariConfig();

        if (dbUrl != null && !dbUrl.isBlank()) {
            config.setJdbcUrl(dbUrl);
            config.setUsername(configuredUsername);
            config.setPassword(configuredPassword);
            if (dbUrl.contains("postgresql")) {
                config.setDriverClassName("org.postgresql.Driver");
            }
            log.info("Using DB_URL datasource");
        } else if (databaseUrl != null && !databaseUrl.isBlank()) {
            String jdbcUrl = databaseUrl;
            if (jdbcUrl.startsWith("postgres://")) {
                jdbcUrl = "jdbc:postgresql://" + jdbcUrl.substring("postgres://".length());
            } else if (jdbcUrl.startsWith("postgresql://")) {
                jdbcUrl = "jdbc:postgresql://" + jdbcUrl.substring("postgresql://".length());
            }
            config.setJdbcUrl(jdbcUrl);
            config.setDriverClassName("org.postgresql.Driver");
            if (configuredUsername != null && !configuredUsername.isBlank() && !configuredUsername.equals("sa")) {
                config.setUsername(configuredUsername);
            }
            if (configuredPassword != null && !configuredPassword.isBlank()) {
                config.setPassword(configuredPassword);
            }
            log.info("Configured cloud datasource from DATABASE_URL");
        } else {
            config.setJdbcUrl(configuredUrl);
            config.setUsername(configuredUsername);
            config.setPassword(configuredPassword);
            if (driverClassName != null && !driverClassName.isBlank()) {
                config.setDriverClassName(driverClassName);
            }
            log.info("Using local datasource: {}", configuredUrl);
        }

        return new HikariDataSource(config);
    }
}
