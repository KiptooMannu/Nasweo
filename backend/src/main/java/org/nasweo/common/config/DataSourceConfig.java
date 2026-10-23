package org.nasweo.common.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Slf4j
@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:sa}")
    private String defaultUsername;

    @Value("${spring.datasource.password:}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String url = rawUrl;
        String username = defaultUsername;
        String password = defaultPassword;

        // Support standard PostgreSQL URI: postgresql://[user[:password]@]host[:port][/database]
        if (url != null && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
            try {
                URI uri = new URI(url.replace("postgresql://", "http://").replace("postgres://", "http://"));
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String database = (path != null && path.length() > 1) ? path.substring(1) : "postgres";

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    username = userInfo[0];
                    if (userInfo.length > 1) {
                        password = userInfo[1];
                    }
                }

                url = String.format("jdbc:postgresql://%s:%d/%s?sslmode=require", host, port, database);
                log.info("Converted PostgreSQL URL to JDBC target: jdbc:postgresql://{}:{}/{}", host, port, database);
            } catch (Exception e) {
                log.warn("Failed to parse PostgreSQL URI, attempting direct connection: {}", e.getMessage());
            }
        }

        if (url != null && url.startsWith("jdbc:postgresql:")) {
            log.info("Configuring PostgreSQL Datasource for live cloud database: {}", sanitizeUrl(url));
            config.setDriverClassName("org.postgresql.Driver");
        } else {
            log.info("Configuring H2 Embedded Datasource for local storage: {}", url);
            config.setDriverClassName("org.h2.Driver");
        }

        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        config.setPoolName("NasweoHikariPool");

        return new HikariDataSource(config);
    }

    private String sanitizeUrl(String url) {
        if (url == null) return "";
        return url.replaceAll(":[^/@]+@", ":****@");
    }
}
