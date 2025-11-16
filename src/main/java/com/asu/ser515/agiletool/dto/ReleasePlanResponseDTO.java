package com.asu.ser515.agiletool.dto;

import com.asu.ser515.agiletool.models.ReleaseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReleasePlanResponseDTO {

    private Long id;

    private String releaseKey;

    private String name;

    private String description;

    private String goals;

    private LocalDate startDate;

    private LocalDate targetDate;

    private ReleaseStatus status;

    private Long projectId;

    private String projectName;

    private Long createdByUserId;

    private String createdByUsername;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer userStoryCount;
}
