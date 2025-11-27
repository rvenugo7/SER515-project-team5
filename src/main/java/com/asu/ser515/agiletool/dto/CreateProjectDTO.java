package com.asu.ser515.agiletool.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectDTO {

    @NotBlank(message = "Project name is required")
    @Size(max = 200, message = "Project name must not exceed 200 characters")
    private String name;

    private String description;
}

