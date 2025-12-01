package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.models.Project;
import com.asu.ser515.agiletool.models.ProjectMember;
import com.asu.ser515.agiletool.models.User;
import com.asu.ser515.agiletool.models.UserRole;
import com.asu.ser515.agiletool.repository.ProjectMemberRepository;
import com.asu.ser515.agiletool.repository.ProjectRepository;
import com.asu.ser515.agiletool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ProjectMember addUserToProject(Long projectId, Long userId, UserRole role) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<ProjectMember> existing = projectMemberRepository
                .findByProjectIdAndUserIdAndRole(projectId, userId, role);

        if (existing.isPresent()) {
            return existing.get();
        }

        ProjectMember pm = new ProjectMember();
        pm.setProject(project);
        pm.setUser(user);
        pm.setRole(role);

        return projectMemberRepository.save(pm);
    }

    @Transactional
    public void removeUserFromProject(Long projectId, Long userId) {
        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    @Transactional
    public void updateUserRoleInProject(Long projectId, Long userId, Set<UserRole> newRoles) {
        if (newRoles == null || newRoles.isEmpty()) {
            throw new RuntimeException("At least one role must be provided");
        }
        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
        for (UserRole role : newRoles) {
            addUserToProject(projectId, userId, role);
        }
    }

    @Transactional(readOnly = true)
    public List<UserRole> getUserRolesInProject(Long projectId, Long userId) {
        return projectMemberRepository.findRolesByProjectIdAndUserId(projectId, userId);
    }

    @Transactional(readOnly = true)
    public boolean hasUserRoleInProject(Long projectId, Long userId, UserRole role) {
        return projectMemberRepository
                .findByProjectIdAndUserIdAndRole(projectId, userId, role)
                .isPresent();
    }

    @Transactional(readOnly = true)
    public Project getDefaultProject() {
        return projectRepository.findByProjectKey("DEFAULT")
                .orElseGet(() -> {
                    Project defaultProject = new Project();
                    defaultProject.setName("Default Project");
                    defaultProject.setProjectKey("DEFAULT");
                    defaultProject.setDescription("Default project for new users");
                    defaultProject.setActive(true);
                    return projectRepository.save(defaultProject);
                });
    }
}
