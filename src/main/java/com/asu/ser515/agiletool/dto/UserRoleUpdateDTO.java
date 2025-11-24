package com.asu.ser515.agiletool.dto;

import com.asu.ser515.agiletool.models.UserRole;
import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public class UserRoleUpdateDTO {

    @NotEmpty(message = "At least one role must be provided")
    private Set<UserRole> roles;

    public UserRoleUpdateDTO() {
    }

    public UserRoleUpdateDTO(Set<UserRole> roles) {
        this.roles = roles;
    }

    public Set<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<UserRole> roles) {
        this.roles = roles;
    }
}
