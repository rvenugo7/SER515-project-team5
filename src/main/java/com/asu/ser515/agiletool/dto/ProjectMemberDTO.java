package com.asu.ser515.agiletool.dto;

import com.asu.ser515.agiletool.models.UserRole;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public class ProjectMemberDTO {
    @NotNull
    private Long userId;

    @NotNull
    private Set<UserRole> roles;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Set<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<UserRole> roles) {
        this.roles = roles;
    }
}
