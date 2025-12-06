package com.asu.ser515.agiletool.dto;

import com.asu.ser515.agiletool.models.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectDTO {
    
    @NotBlank(message = "Project name is required")
    @Size(max = 200, message = "Project name must not exceed 200 characters")
    private String name;
    
    private String description;
    
    @Size(min = 1, message = "At least one member with role is required")
    private List<ProjectMemberDTO> members;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectMemberDTO {
        @NotNull(message = "User ID is required")
        private Long userId;
        
        @NotNull(message = "Role is required")
        private UserRole role;
    }
}

