package com.asu.ser515.agiletool.controller;

import com.asu.ser515.agiletool.dto.CreateReleasePlanDTO;
import com.asu.ser515.agiletool.dto.ReleasePlanResponseDTO;
import com.asu.ser515.agiletool.dto.UpdateReleasePlanDTO;
import com.asu.ser515.agiletool.models.ReleaseStatus;
import com.asu.ser515.agiletool.service.ReleasePlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/release-plans")
public class ReleasePlanController {

    private final ReleasePlanService releasePlanService;

    public ReleasePlanController(ReleasePlanService releasePlanService) {
        this.releasePlanService = releasePlanService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PRODUCT_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> createReleasePlan(@Valid @RequestBody CreateReleasePlanDTO dto) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            ReleasePlanResponseDTO response = releasePlanService.create(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating release plan: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getReleasePlanById(@PathVariable Long id) {
        try {
            ReleasePlanResponseDTO response = releasePlanService.findById(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving release plan: " + e.getMessage());
        }
    }

    @GetMapping("/key/{releaseKey}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getReleasePlanByKey(@PathVariable String releaseKey) {
        try {
            ReleasePlanResponseDTO response = releasePlanService.findByReleaseKey(releaseKey);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving release plan: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PRODUCT_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> updateReleasePlan(@PathVariable Long id,
                                               @Valid @RequestBody UpdateReleasePlanDTO dto) {
        try {
            ReleasePlanResponseDTO response = releasePlanService.update(id, dto);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating release plan: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PRODUCT_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> deleteReleasePlan(@PathVariable Long id) {
        try {
            releasePlanService.delete(id);
            return ResponseEntity.ok("Release plan deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting release plan: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listAllReleasePlans() {
        try {
            List<ReleasePlanResponseDTO> response = releasePlanService.listAll();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving release plans: " + e.getMessage());
        }
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listReleasePlansByProject(@PathVariable Long projectId) {
        try {
            List<ReleasePlanResponseDTO> response = releasePlanService.listByProject(projectId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving release plans: " + e.getMessage());
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listReleasePlansByStatus(@PathVariable ReleaseStatus status) {
        try {
            List<ReleasePlanResponseDTO> response = releasePlanService.listByStatus(status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving release plans: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/user-stories/{storyId}")
    @PreAuthorize("hasAnyRole('PRODUCT_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> assignUserStory(@PathVariable Long id, @PathVariable Long storyId) {
        try {
            ReleasePlanResponseDTO response = releasePlanService.assignUserStory(id, storyId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error assigning user story: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}/user-stories/{storyId}")
    @PreAuthorize("hasAnyRole('PRODUCT_OWNER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> unassignUserStory(@PathVariable Long id, @PathVariable Long storyId) {
        try {
            ReleasePlanResponseDTO response = releasePlanService.unassignUserStory(id, storyId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error unassigning user story: " + e.getMessage());
        }
    }
}
