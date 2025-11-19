package com.asu.ser515.agiletool.dto;

import com.asu.ser515.agiletool.models.ReleaseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReleasePlanDTO {

    @NotBlank(message = "Release name is required")
    private String name;

    private String description;

    private String goals;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Target date is required")
    private LocalDate targetDate;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private ReleaseStatus status;
}
