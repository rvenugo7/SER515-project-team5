package com.asu.ser515.agiletool.controller;

import com.asu.ser515.agiletool.dto.EstimateRequest;
import com.asu.ser515.agiletool.dto.JiraIssueResponse;
import com.asu.ser515.agiletool.dto.ReleasePlanResponseDTO;

import com.asu.ser515.agiletool.models.*;
import com.asu.ser515.agiletool.service.ReleasePlanService;
import com.asu.ser515.agiletool.service.UserStoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {
    private final UserStoryService userStoryService;
    private final ReleasePlanService releasePlanService;
    public StoryController(UserStoryService userStoryService, ReleasePlanService releasePlanService) {
        this.userStoryService = userStoryService;
        this.releasePlanService = releasePlanService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@Valid @RequestBody CreateStoryReq req, @RequestParam(required = false) Long projectId) {
        try {
            UserStory s = userStoryService.create(
                req.getTitle(), req.getDescription(), req.getAcceptanceCriteria(),
                req.getBusinessValue(), req.getPriority(), projectId
            );
            return ResponseEntity.status(201).body(new CreateStoryRes("User Story created successfully", s));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> list(@RequestParam(required = false) Long projectId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            List<UserStory> stories;
            if (projectId != null) {
                stories = userStoryService.listByProjectId(projectId, username);
            } else {
                stories = userStoryService.listAll(username);
            }
            return ResponseEntity.ok(stories);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody CreateStoryReq req) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            UserStory s = userStoryService.updateUserStory(
                id,
                req.getTitle(), req.getDescription(), req.getAcceptanceCriteria(),
                req.getBusinessValue(), req.getPriority(), username
            );
            return ResponseEntity.ok(new CreateStoryRes("User Story updated successfully", s));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteUserStory(@PathVariable Long id) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            userStoryService.deleteUserStory(id, username);
            return ResponseEntity.ok("User Story deleted successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/estimate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateStoryEstimation(
            @PathVariable long id,
            @RequestBody EstimateRequest estimateRequest) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            UserStory updated =
                    userStoryService.updateEstimation(id, estimateRequest.getStoryPoints(), username);

            return ResponseEntity.ok(updated);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/export/jira")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> exportToJira(@PathVariable Long id) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            JiraIssueResponse response = userStoryService.exportStoryToJira(id, username);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error exporting story to JIRA: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusReq req
    ) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            UserStory updated = userStoryService.updateStatus(id, req.getStatus(), username);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/release-plan")
    @PreAuthorize("hasAnyRole('PRODUCT_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> linkToReleasePlan(
            @PathVariable Long id,
            @Valid @RequestBody LinkReleasePlanReq req
    ) {
        try {
            ReleasePlanResponseDTO response = releasePlanService.assignUserStoryByIdentifier(
                    req.getReleasePlanId(), id);
            return ResponseEntity.ok(new LinkReleasePlanRes(
                    "User story linked to release plan successfully",
                    id,
                    response
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error linking user story to release plan: " + e.getMessage());
        }
    }
    

    @PutMapping("/{id}/sprint-ready")
    @PreAuthorize("hasAnyRole('PRODUCT_OWNER', 'SCRUM_MASTER')")
    public ResponseEntity<?> updateSprintReady(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSprintReadyReq req
    ) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            UserStory updated = userStoryService.updateSprintReady(id, req.isSprintReady(), username);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/star")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateStar(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStarReq req
    ) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            UserStory updated = userStoryService.updateStarred(id, req.isStarred(), username);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/mvp")
    @PreAuthorize("hasAnyRole('PRODUCT_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> updateMvp(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMvpReq req
    ) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            UserStory updated = userStoryService.updateMvp(id, req.isMvp(), username);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    public static class CreateStoryReq {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        private String acceptanceCriteria;
        private Integer businessValue;
        private StoryPriority priority;

        public String getTitle() { return title; }
        public void setTitle(String v) { title = v; }

        public String getDescription() { return description; }
        public void setDescription(String v) { description = v; }

        public String getAcceptanceCriteria() { return acceptanceCriteria; }
        public void setAcceptanceCriteria(String v) { acceptanceCriteria = v; }

        public Integer getBusinessValue() { return businessValue; }
        public void setBusinessValue(Integer v) { businessValue = v; }

        public StoryPriority getPriority() { return priority; }
        public void setPriority(StoryPriority v) { priority = v; }
    }

    public static class UpdateStatusReq {
        @NotNull(message = "Status is required")
        private StoryStatus status;

        public StoryStatus getStatus() {
            return status;
        }

        public void setStatus(StoryStatus status) {
            this.status = status;
        }
    }

    public static class UpdateSprintReadyReq {
        @NotNull(message = "Sprint readiness is required")
        private Boolean sprintReady;

        public Boolean getSprintReady() {
            return sprintReady;
        }

        public void setSprintReady(Boolean sprintReady) {
            this.sprintReady = sprintReady;
        }

        public boolean isSprintReady() {
            return sprintReady != null && sprintReady;
        }
    }

    public static class UpdateStarReq {
        @NotNull(message = "Star value is required")
        private Boolean starred;

        public Boolean getStarred() {
            return starred;
        }

        public void setStarred(Boolean starred) {
            this.starred = starred;
        }

        public boolean isStarred() {
            return starred != null && starred;
        }
    }

    public static class UpdateMvpReq {
        @NotNull(message = "MVP value is required")
        private Boolean mvp;

        public Boolean getMvp() {
            return mvp;
        }

        public void setMvp(Boolean mvp) {
            this.mvp = mvp;
        }

        public boolean isMvp() {
            return mvp != null && mvp;
        }
    }

    public static class LinkReleasePlanReq {
        @NotBlank(message = "Release plan id or key is required")
        private String releasePlanId;

        public String getReleasePlanId() {
            return releasePlanId;
        }

        public void setReleasePlanId(String releasePlanId) {
            this.releasePlanId = releasePlanId;
        }
    }
    public static class LinkReleasePlanRes {
        private String message;
        private Long storyId;
        private ReleasePlanResponseDTO releasePlan;

        public LinkReleasePlanRes() {}

        public LinkReleasePlanRes(String message, Long storyId, ReleasePlanResponseDTO releasePlan) {
            this.message = message;
            this.storyId = storyId;
            this.releasePlan = releasePlan;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Long getStoryId() {
            return storyId;
        }

        public void setStoryId(Long storyId) {
            this.storyId = storyId;
        }

        public ReleasePlanResponseDTO getReleasePlan() {
            return releasePlan;
        }

        public void setReleasePlan(ReleasePlanResponseDTO releasePlan) {
            this.releasePlan = releasePlan;
        }
    }
    public static class CreateStoryRes {
        private String message; private UserStory story;
        public CreateStoryRes() {} public CreateStoryRes(String m, UserStory s){message=m;story=s;}
        public String getMessage(){return message;} public void setMessage(String v){message=v;}
        public UserStory getStory(){return story;} public void setStory(UserStory v){story=v;}
    }
}
