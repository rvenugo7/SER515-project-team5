package com.asu.ser515.agiletool.controller;

import com.asu.ser515.agiletool.dto.ProjectMemberDTO;
import com.asu.ser515.agiletool.dto.ProjectMemberResponseDTO;
import com.asu.ser515.agiletool.models.ProjectMember;
import com.asu.ser515.agiletool.models.UserRole;
import com.asu.ser515.agiletool.repository.ProjectMemberRepository;
import com.asu.ser515.agiletool.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    // Add user to project with roles
    @PostMapping("/{projectId}/members")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRoleInProject(#projectId, 'PRODUCT_OWNER')")
    public ResponseEntity<?> addMemberToProject(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectMemberDTO dto) {
        try {
            for (UserRole role : dto.getRoles()) {
                projectService.addUserToProject(projectId, dto.getUserId(), role);
            }
            return ResponseEntity.ok("User added to project successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update user roles in a project
    @PutMapping("/{projectId}/members/{userId}/roles")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRoleInProject(#projectId, 'PRODUCT_OWNER')")
    public ResponseEntity<?> updateMemberRoles(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @Valid @RequestBody ProjectMemberDTO dto) {
        try {
            projectService.updateUserRoleInProject(projectId, userId, dto.getRoles());
            return ResponseEntity.ok("User roles updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Remove user from project (all roles)
    @DeleteMapping("/{projectId}/members/{userId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRoleInProject(#projectId, 'PRODUCT_OWNER')")
    public ResponseEntity<?> removeMemberFromProject(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        try {
            projectService.removeUserFromProject(projectId, userId);
            return ResponseEntity.ok("User removed from project successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get all members of a project with their roles
    @GetMapping("/{projectId}/members")
    @PreAuthorize("isMemberOfProject(#projectId)")
    public ResponseEntity<?> getProjectMembers(@PathVariable Long projectId) {
        try {
            List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);

            Map<Long, Set<UserRole>> userRolesMap = members.stream()
                    .collect(Collectors.groupingBy(
                            pm -> pm.getUser().getId(),
                            Collectors.mapping(ProjectMember::getRole, Collectors.toSet())));

            List<ProjectMemberResponseDTO> response = members.stream()
                    .map(ProjectMember::getUser)
                    .distinct()
                    .map(user -> new ProjectMemberResponseDTO(
                            user.getId(),
                            user.getUsername(),
                            user.getFullName(),
                            user.getEmail(),
                            userRolesMap.get(user.getId())))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
