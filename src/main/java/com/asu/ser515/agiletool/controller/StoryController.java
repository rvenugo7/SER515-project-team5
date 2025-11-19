package com.asu.ser515.agiletool.controller;

import com.asu.ser515.agiletool.dto.EstimateRequest;

import com.asu.ser515.agiletool.models.*;
import com.asu.ser515.agiletool.service.UserStoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {
    private final UserStoryService userStoryService;
    public StoryController(UserStoryService userStoryService) { this.userStoryService = userStoryService; }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@Valid @RequestBody CreateStoryReq req) {
        try {
            UserStory s = userStoryService.create(
                req.getTitle(), req.getDescription(), req.getAcceptanceCriteria(),
                req.getBusinessValue(), req.getPriority()
            );
            return ResponseEntity.status(201).body(new CreateStoryRes("User Story created successfully", s));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> list() {
        try {
            List<UserStory> stories = userStoryService.listAll();
            return ResponseEntity.ok(stories);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody CreateStoryReq req) {
        try {
            UserStory s = userStoryService.updateUserStory(
                id,
                req.getTitle(), req.getDescription(), req.getAcceptanceCriteria(),
                req.getBusinessValue(), req.getPriority()
            );
            return ResponseEntity.ok(new CreateStoryRes("User Story updated successfully", s));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteUserStory(@PathVariable Long id) {
        try {
            userStoryService.deleteUserStory(id);
            return ResponseEntity.ok("User Story deleted successfully");
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
            UserStory updated =
                    userStoryService.updateEstimation(id, estimateRequest.getStoryPoints());

            return ResponseEntity.ok(updated);

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
    public static class CreateStoryRes {
        private String message; private UserStory story;
        public CreateStoryRes() {} public CreateStoryRes(String m, UserStory s){message=m;story=s;}
        public String getMessage(){return message;} public void setMessage(String v){message=v;}
        public UserStory getStory(){return story;} public void setStory(UserStory v){story=v;}
    }
}