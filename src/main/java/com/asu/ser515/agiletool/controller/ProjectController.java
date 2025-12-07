package com.asu.ser515.agiletool.controller;

import com.asu.ser515.agiletool.models.Project;
import com.asu.ser515.agiletool.models.User;
import com.asu.ser515.agiletool.service.ProjectService;
import com.asu.ser515.agiletool.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('PRODUCT_OWNER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<?> createProject(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String description = payload.get("description");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Project name is required");
        }

        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User creator = userService.getCurrentUserProfile(username);
            Project project = projectService.createProject(name, description, creator);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<?> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyProjects() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            return ResponseEntity.ok(projectService.getProjectsByUser(username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id) {
        try {
             // In a real app, we'd check if the user is a member of this project
            return ResponseEntity.ok(projectService.getProjectById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
