package com.findit.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

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
            try {
                String cleanUrl = databaseUrl;
                if (cleanUrl.startsWith("jdbc:")) {
                    cleanUrl = cleanUrl.substring(5);
                }
                URI uri = new URI(cleanUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + (query != null ? "?" + query : "");
                config.setJdbcUrl(jdbcUrl);
                config.setDriverClassName("org.postgresql.Driver");

                if (uri.getUserInfo() != null) {
                    String[] userParts = uri.getUserInfo().split(":", 2);
                    config.setUsername(userParts[0]);
                    if (userParts.length > 1) {
                        config.setPassword(userParts[1]);
                    }
                } else {
                    config.setUsername(configuredUsername);
                    config.setPassword(configuredPassword);
                }
                log.info("Successfully parsed cloud DATABASE_URL -> {}", jdbcUrl);
            } catch (Exception e) {
                log.error("Failed to parse DATABASE_URL, falling back to direct string", e);
                config.setJdbcUrl(databaseUrl);
                config.setUsername(configuredUsername);
                config.setPassword(configuredPassword);
            }
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
