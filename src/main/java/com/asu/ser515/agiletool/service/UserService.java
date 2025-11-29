package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.dto.UserProfileUpdateDTO;
import com.asu.ser515.agiletool.models.User;
import com.asu.ser515.agiletool.models.UserRole;
import com.asu.ser515.agiletool.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public User registerUser(User user) {

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            throw new RuntimeException("Selection must be done!");
        }

        if (user.getRoles().size() != 1) {
            throw new RuntimeException("Exactly one role must be selected.");
        }

        if (user.getRoles().contains(UserRole.SYSTEM_ADMIN)) {
            throw new RuntimeException("System Admin accounts cannot be self-registered.");
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

    public User deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setActive(false);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        entityManager.createNativeQuery("DELETE FROM project_members WHERE user_id = :userId")
                .setParameter("userId", id)
                .executeUpdate();
        entityManager.createQuery("UPDATE UserStory us SET us.createdBy = NULL WHERE us.createdBy.id = :userId")
                .setParameter("userId", id)
                .executeUpdate();
        entityManager.createQuery("UPDATE UserStory us SET us.assignedTo = NULL WHERE us.assignedTo.id = :userId")
                .setParameter("userId", id)
                .executeUpdate();
        entityManager.createQuery("UPDATE Task t SET t.assignedTo = NULL WHERE t.assignedTo.id = :userId")
                .setParameter("userId", id)
                .executeUpdate();
        entityManager.createQuery("UPDATE ReleasePlan rp SET rp.createdBy = NULL WHERE rp.createdBy.id = :userId")
                .setParameter("userId", id)
                .executeUpdate();
        userRepository.delete(user);
    }

    public User getCurrentUserProfile(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public User updateUserProfile(String username, UserProfileUpdateDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        if (dto.getFullName() != null) {
            user.setFullName(dto.getFullName());
        }

        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            Optional<User> existingUser = userRepository.findByEmail(dto.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                throw new RuntimeException("Email already exists!");
            }
            user.setEmail(dto.getEmail());
        }

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRoles(Long userId, Set<UserRole> roles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (roles == null || roles.isEmpty()) {
            throw new RuntimeException("At least one role must be provided");
        }

        user.setRoles(roles);
        return userRepository.save(user);
    }
}
