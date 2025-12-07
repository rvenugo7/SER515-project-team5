package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.models.Project;
import com.asu.ser515.agiletool.models.User;
import com.asu.ser515.agiletool.repository.ProjectRepository;
import com.asu.ser515.agiletool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }
    
    public Set<Project> getProjectsByUser(String username) {
         User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
         return user.getProjects();
    }

    @Transactional
    public Project createProject(String name, String description, User creator) {
        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setActive(true);
        project.setProjectKey("TEMP-" + UUID.randomUUID());
        // Generate unique 8-char code
        project.setProjectCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        project.getMembers().add(creator);

        Project savedProject = projectRepository.save(project);
        
        // Update Key
        savedProject.setProjectKey("PROJ-" + savedProject.getId());
        return projectRepository.save(savedProject);
    }

    @Transactional
    public void addUserToProject(String projectCode, User user) {
        Project project = projectRepository.findByProjectCode(projectCode)
                .orElseThrow(() -> new RuntimeException("Invalid Project Code: " + projectCode));
        
        project.getMembers().add(user);
        projectRepository.save(project);
    }
}
