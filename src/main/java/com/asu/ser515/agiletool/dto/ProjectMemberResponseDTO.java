package com.asu.ser515.agiletool.dto;

import com.asu.ser515.agiletool.models.UserRole;
import java.util.Set;

public class ProjectMemberResponseDTO {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private Set<UserRole> projectRoles;

    public ProjectMemberResponseDTO() {
    }

    public ProjectMemberResponseDTO(Long userId, String username, String fullName, String email,
            Set<UserRole> projectRoles) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.projectRoles = projectRoles;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Set<UserRole> getProjectRoles() {
        return projectRoles;
    }

    public void setProjectRoles(Set<UserRole> projectRoles) {
        this.projectRoles = projectRoles;
    }
}
