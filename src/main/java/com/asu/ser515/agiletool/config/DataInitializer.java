package com.asu.ser515.agiletool.config;

import com.asu.ser515.agiletool.models.User;
import com.asu.ser515.agiletool.models.UserRole;
import com.asu.ser515.agiletool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createDefaultAdminAccount();
    }

    private void createDefaultAdminAccount() {
        // Check if admin account already exists
        if (userRepository.findByUsername("admin").isPresent()) {
            System.out.println("Default admin account already exists");
            return;
        }

        // Create default admin account
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@agiletool.com");
        admin.setPassword(passwordEncoder.encode("admin"));
        admin.setFullName("System Administrator");
        admin.setActive(true);

        // Set SYSTEM_ADMIN role
        Set<UserRole> systemRoles = new HashSet<>();
        systemRoles.add(UserRole.SYSTEM_ADMIN);
        admin.setSystemRoles(systemRoles);

        userRepository.save(admin);
        System.out.println("Default admin account created successfully");
        System.out.println("Username: admin");
        System.out.println("Password: admin");
        System.out.println("IMPORTANT: Please change the default password after first login!");
    }
}
