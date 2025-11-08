package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.models.User;
import com.asu.ser515.agiletool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User registerUser(User user){

        if(userRepository.existsByUsername(user.getUsername())){
            throw new RuntimeException("Username already exists!");
        }

        if(userRepository.existsByEmail(user.getEmail())){
            throw new RuntimeException("Email already exists!");
        }

        if (user.getRoles() == null || user.getRoles().isEmpty()){
            throw new RuntimeException("Selection must be done!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
