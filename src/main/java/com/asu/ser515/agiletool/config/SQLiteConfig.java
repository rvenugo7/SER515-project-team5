package com.asu.ser515.agiletool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;
import java.sql.SQLException;

@Configuration
public class SQLiteConfig {
    
    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.sqlite.JDBC");
        dataSource.setUrl("jdbc:sqlite:agile_tool.db");
        
        try {
            dataSource.getConnection().createStatement().execute("PRAGMA foreign_keys = ON;");
        } catch (SQLException e) {
            throw new RuntimeException("Failed to enable foreign keys", e);
        }
        
        return dataSource;
    }
}