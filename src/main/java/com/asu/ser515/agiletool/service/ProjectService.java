package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.dto.CreateProjectDTO;
import com.asu.ser515.agiletool.dto.ProjectResponseDTO;
import com.asu.ser515.agiletool.models.Project;
import com.asu.ser515.agiletool.models.User;
import com.asu.ser515.agiletool.repository.ProjectRepository;
import com.asu.ser515.agiletool.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;

    private static final String PROJECT_KEY_PREFIX = "PROJ";
    private static final int PAD = 3;

    public ProjectService(ProjectRepository projectRepo, UserRepository userRepo) {
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public ProjectResponseDTO create(CreateProjectDTO dto, String username) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Project name is required");
        }

        // Get the creator user
        User createdBy = null;
        if (username != null) {
            createdBy = userRepo.findByUsername(username).orElse(null);
        }

        // Create the project
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

        // Add creator as a project member if user exists
        if (createdBy != null) {
            project.getMembers().add(createdBy);
        }

        project = projectRepo.save(project);

        return toResponseDTO(project);
    }

    @Transactional(readOnly = true)
    public ProjectResponseDTO findById(Long id) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));
        return toResponseDTO(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDTO> listAll() {
        return projectRepo.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private ProjectResponseDTO toResponseDTO(Project project) {
        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setProjectKey(project.getProjectKey());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setActive(project.getActive());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());

        // Set member count
        if (project.getMembers() != null) {
            dto.setMemberCount(project.getMembers().size());
        } else {
            dto.setMemberCount(0);
        }

        // Set release plan count
        if (project.getReleasePlans() != null) {
            dto.setReleasePlanCount(project.getReleasePlans().size());
        } else {
            dto.setReleasePlanCount(0);
        }

        // Set user story count
        if (project.getUserStories() != null) {
            dto.setUserStoryCount(project.getUserStories().size());
        } else {
            dto.setUserStoryCount(0);
        }

        return dto;
    }
}

