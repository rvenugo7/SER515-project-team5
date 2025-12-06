package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.dto.CreateProjectDTO;
import com.asu.ser515.agiletool.dto.CreateProjectResponseDTO;
import com.asu.ser515.agiletool.models.*;
import com.asu.ser515.agiletool.repository.ProjectMemberRepository;
import com.asu.ser515.agiletool.repository.ProjectRepository;
import com.asu.ser515.agiletool.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProjectService {
    
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final ProjectMemberRepository projectMemberRepo;
    
    public ProjectService(ProjectRepository projectRepo, 
                         UserRepository userRepo,
                         ProjectMemberRepository projectMemberRepo) {
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.projectMemberRepo = projectMemberRepo;
    }
    
    @Transactional
    public CreateProjectResponseDTO createProject(CreateProjectDTO dto) {
        // Validate input
        validateProjectDTO(dto);
        
        // Generate unique project key
        String projectKey = generateProjectKey(dto.getName());
        
        // Create project
        Project project = new Project();
        project.setName(dto.getName().trim());
        project.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        project.setActive(true);
        
        // Set a temporary unique project key to satisfy NOT NULL constraint
        // We'll update it with the final key after getting the ID
        // Using nanoTime for better uniqueness, especially under concurrent requests
        String tempKey = "TEMP-" + System.nanoTime();
        project.setProjectKey(tempKey);

        // Save to get the ID for key generation
        project = projectRepo.save(project);

        // Generate final project key based on ID (IDs are auto-generated and unique)
        Long projectId = project.getId();
        if (projectId == null) {
            throw new IllegalStateException("Project ID is null after save");
        }
        String projectKey = PROJECT_KEY_PREFIX + "-" + String.format("%0" + PAD + "d", projectId);
        project.setProjectKey(projectKey);
        project.setActive(true);
        
        // Assign members and roles
        Set<User> membersSet = new HashSet<>();
        if (dto.getMembers() != null && !dto.getMembers().isEmpty()) {
            // First, set members before saving
            for (CreateProjectDTO.ProjectMemberDTO memberDTO : dto.getMembers()) {
                // Validate and fetch user
                User user = userRepo.findById(memberDTO.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException(
                        "User not found with ID: " + memberDTO.getUserId()));
                
                // Add user to members set
                membersSet.add(user);
            }
            project.setMembers(membersSet);
        }
        
        // Save project (with members already set)
        project = projectRepo.save(project);
        
        // Now create project member role assignments
        if (dto.getMembers() != null && !dto.getMembers().isEmpty()) {
            for (CreateProjectDTO.ProjectMemberDTO memberDTO : dto.getMembers()) {
                User user = userRepo.findById(memberDTO.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException(
                        "User not found with ID: " + memberDTO.getUserId()));
                
                // Create project member role assignment (no need to check for new project)
                ProjectMember projectMember = new ProjectMember();
                projectMember.setProject(project);
                projectMember.setUser(user);
                projectMember.setRole(memberDTO.getRole());
                projectMemberRepo.save(projectMember);
            }
        }
        
        // Return response with project ID and key
        return new CreateProjectResponseDTO(
            "Project created successfully",
            project.getId(),
            project.getProjectKey()
        );
    }
    
    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return projectRepo.findAll();
    }
    
    @Transactional(readOnly = true)
    public Project getProjectById(Long projectId) {
        return projectRepo.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));
    }
    
    @Transactional(readOnly = true)
    public Project getProjectByProjectKey(String projectKey) {
        return projectRepo.findByProjectKey(projectKey)
            .orElseThrow(() -> new IllegalArgumentException("Project not found with key: " + projectKey));
    }
    
    @Transactional(readOnly = true)
    public List<ProjectMember> getProjectMembers(Long projectId) {
        Project project = getProjectById(projectId);
        return projectMemberRepo.findByProject(project);
    }
    
    private void validateProjectDTO(CreateProjectDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Project data is required");
        }
        
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Project name is required");
        }
        
        if (dto.getName().length() > 200) {
            throw new IllegalArgumentException("Project name must not exceed 200 characters");
        }
        
        if (dto.getMembers() == null || dto.getMembers().isEmpty()) {
            throw new IllegalArgumentException("At least one project member with role is required");
        }
        
        // Validate each member
        Set<Long> userIds = new HashSet<>();
        for (CreateProjectDTO.ProjectMemberDTO member : dto.getMembers()) {
            if (member.getUserId() == null) {
                throw new IllegalArgumentException("User ID is required for all members");
            }
            
            if (member.getRole() == null) {
                throw new IllegalArgumentException("Role is required for all members");
            }
            
            // Check for duplicate user IDs in the same request
            if (userIds.contains(member.getUserId())) {
                throw new IllegalArgumentException("Duplicate user ID found: " + member.getUserId());
            }
            userIds.add(member.getUserId());
        }
    }
    
    private String generateProjectKey(String projectName) {
        // Generate a project key from the project name
        // Take first letters of words, convert to uppercase, limit to 10 characters
        String baseKey = projectName.trim()
            .replaceAll("[^A-Za-z0-9\\s]", "") // Remove special characters
            .replaceAll("\\s+", " ") // Normalize whitespace
            .toUpperCase();
        
        // Extract first letters or first few characters
        String[] words = baseKey.split("\\s+");
        StringBuilder keyBuilder = new StringBuilder();
        
        if (words.length > 1) {
            // Multi-word: take first letter of each word
            for (String word : words) {
                if (!word.isEmpty() && keyBuilder.length() < 10) {
                    keyBuilder.append(word.charAt(0));
                }
            }
        } else if (!baseKey.isEmpty()) {
            // Single word: take first characters
            keyBuilder.append(baseKey.substring(0, Math.min(10, baseKey.length())));
        }
        
        String baseKeyValue = keyBuilder.length() > 0 
            ? keyBuilder.toString() 
            : "PROJ";
        
        // Ensure minimum length of 2
        if (baseKeyValue.length() < 2) {
            baseKeyValue = baseKeyValue + "X";
        }
        
        // Check if key already exists, append number if needed
        String projectKey = baseKeyValue;
        int counter = 1;
        while (projectRepo.existsByProjectKey(projectKey)) {
            String suffix = String.valueOf(counter);
            int remainingLength = 10 - baseKeyValue.length() - suffix.length();
            if (remainingLength < 0) {
                // Truncate base key if needed
                baseKeyValue = baseKeyValue.substring(0, 10 - suffix.length());
            }
            projectKey = baseKeyValue + counter;
            counter++;
        }
        
        return projectKey;
    }
}

