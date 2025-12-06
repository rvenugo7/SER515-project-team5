package com.asu.ser515.agiletool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectResponseDTO {
    private String message;
    private Long projectId;
    private String projectKey;
}

