package com.asu.ser515.agiletool.dto;

import com.asu.ser515.agiletool.models.ReleaseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReleasePlanDTO {

    private String name;

    private String description;

    private String goals;

    private LocalDate startDate;

    private LocalDate targetDate;

    private ReleaseStatus status;
}
