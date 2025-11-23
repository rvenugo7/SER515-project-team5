package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.dto.CreateReleasePlanDTO;
import com.asu.ser515.agiletool.dto.ReleasePlanResponseDTO;
import com.asu.ser515.agiletool.dto.UpdateReleasePlanDTO;
import com.asu.ser515.agiletool.models.*;
import com.asu.ser515.agiletool.repository.ProjectRepository;
import com.asu.ser515.agiletool.repository.ReleasePlanRepository;
import com.asu.ser515.agiletool.repository.UserRepository;
import com.asu.ser515.agiletool.repository.UserStoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReleasePlanService {

    private final ReleasePlanRepository releasePlanRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final UserStoryRepository userStoryRepo;

    private static final String RELEASE_KEY_PREFIX = "REL";
    private static final int PAD = 3;

    public ReleasePlanService(ReleasePlanRepository releasePlanRepo,
                              ProjectRepository projectRepo,
                              UserRepository userRepo,
                              UserStoryRepository userStoryRepo) {
        this.releasePlanRepo = releasePlanRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.userStoryRepo = userStoryRepo;
    }

    @Transactional
    public ReleasePlanResponseDTO create(CreateReleasePlanDTO dto, String username) {

        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Release name is required");
        }
        if (dto.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        if (dto.getTargetDate() == null) {
            throw new IllegalArgumentException("Target date is required");
        }
        if (dto.getProjectId() == null) {
            throw new IllegalArgumentException("Project ID is required");
        }

        if (dto.getTargetDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("Target date must be after start date");
        }

        Project project = projectRepo.findById(dto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + dto.getProjectId()));

        User createdBy = null;
        if (username != null) {
            createdBy = userRepo.findByUsername(username).orElse(null);
        }

        ReleasePlan releasePlan = new ReleasePlan();
        releasePlan.setName(dto.getName());
        releasePlan.setDescription(dto.getDescription());
        releasePlan.setGoals(dto.getGoals());
        releasePlan.setStartDate(dto.getStartDate());
        releasePlan.setTargetDate(dto.getTargetDate());
        releasePlan.setStatus(dto.getStatus() != null ? dto.getStatus() : ReleaseStatus.PLANNED);
        releasePlan.setProject(project);
        releasePlan.setCreatedBy(createdBy);

        releasePlan = releasePlanRepo.save(releasePlan);

        String releaseKey = RELEASE_KEY_PREFIX + "-" + String.format("%0" + PAD + "d", releasePlan.getId());
        releasePlan.setReleaseKey(releaseKey);

        releasePlan = releasePlanRepo.save(releasePlan);

        return toResponseDTO(releasePlan);
    }

    @Transactional(readOnly = true)
    public ReleasePlanResponseDTO findById(Long id) {
        ReleasePlan releasePlan = releasePlanRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Release plan not found with id: " + id));
        return toResponseDTO(releasePlan);
    }

    @Transactional(readOnly = true)
    public ReleasePlanResponseDTO findByReleaseKey(String releaseKey) {
        ReleasePlan releasePlan = releasePlanRepo.findByReleaseKey(releaseKey)
                .orElseThrow(() -> new IllegalArgumentException("Release plan not found with key: " + releaseKey));
        return toResponseDTO(releasePlan);
    }

    @Transactional
    public ReleasePlanResponseDTO update(Long id, UpdateReleasePlanDTO dto) {
        ReleasePlan releasePlan = releasePlanRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Release plan not found with id: " + id));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            releasePlan.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            releasePlan.setDescription(dto.getDescription());
        }
        if (dto.getGoals() != null) {
            releasePlan.setGoals(dto.getGoals());
        }
        if (dto.getStartDate() != null) {
            releasePlan.setStartDate(dto.getStartDate());
        }
        if (dto.getTargetDate() != null) {
            releasePlan.setTargetDate(dto.getTargetDate());
        }
        if (dto.getStatus() != null) {
            releasePlan.setStatus(dto.getStatus());
        }

        if (releasePlan.getTargetDate().isBefore(releasePlan.getStartDate())) {
            throw new IllegalArgumentException("Target date must be after start date");
        }

        releasePlan = releasePlanRepo.save(releasePlan);
        return toResponseDTO(releasePlan);
    }

    @Transactional
    public void delete(Long id) {
        ReleasePlan releasePlan = releasePlanRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Release plan not found with id: " + id));
        releasePlanRepo.delete(releasePlan);
    }

    @Transactional(readOnly = true)
    public List<ReleasePlanResponseDTO> listAll() {
        return releasePlanRepo.findAllByOrderByIdAsc()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReleasePlanResponseDTO> listByProject(Long projectId) {

        projectRepo.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        return releasePlanRepo.findByProjectId(projectId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReleasePlanResponseDTO> listByStatus(ReleaseStatus status) {
        return releasePlanRepo.findByStatus(status)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReleasePlanResponseDTO assignUserStoryByIdentifier(String releasePlanIdentifier, Long userStoryId) {
        if (releasePlanIdentifier == null || releasePlanIdentifier.isBlank()) {
            throw new IllegalArgumentException("Release plan identifier is required");
        }

        String identifier = releasePlanIdentifier.trim();
        ReleasePlan releasePlan;
        try {
            Long id = Long.parseLong(identifier);
            releasePlan = releasePlanRepo.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Release plan not found with id: " + id));
        } catch (NumberFormatException ignored) {
            releasePlan = releasePlanRepo.findByReleaseKey(identifier)
                    .orElseThrow(() -> new IllegalArgumentException("Release plan not found with key: " + identifier));
        }

        UserStory userStory = userStoryRepo.findById(userStoryId)
                .orElseThrow(() -> new IllegalArgumentException("User story not found with id: " + userStoryId));

        return assignUserStoryToPlan(releasePlan, userStory);
    }

    @Transactional
    public ReleasePlanResponseDTO assignUserStory(Long releasePlanId, Long userStoryId) {
        ReleasePlan releasePlan = releasePlanRepo.findById(releasePlanId)
                .orElseThrow(() -> new IllegalArgumentException("Release plan not found with id: " + releasePlanId));

        UserStory userStory = userStoryRepo.findById(userStoryId)
                .orElseThrow(() -> new IllegalArgumentException("User story not found with id: " + userStoryId));

        return assignUserStoryToPlan(releasePlan, userStory);
    }

    @Transactional
    public ReleasePlanResponseDTO unassignUserStory(Long releasePlanId, Long userStoryId) {
        ReleasePlan releasePlan = releasePlanRepo.findById(releasePlanId)
                .orElseThrow(() -> new IllegalArgumentException("Release plan not found with id: " + releasePlanId));

        UserStory userStory = userStoryRepo.findById(userStoryId)
                .orElseThrow(() -> new IllegalArgumentException("User story not found with id: " + userStoryId));

        if (userStory.getReleasePlan() == null || !userStory.getReleasePlan().getId().equals(releasePlanId)) {
            throw new IllegalArgumentException("User story is not assigned to this release plan");
        }

        userStory.setReleasePlan(null);
        userStoryRepo.save(userStory);

        return toResponseDTO(releasePlan);
    }

    private ReleasePlanResponseDTO assignUserStoryToPlan(ReleasePlan releasePlan, UserStory userStory) {
        if (releasePlan == null) {
            throw new IllegalArgumentException("Release plan is required");
        }
        if (userStory == null) {
            throw new IllegalArgumentException("User story is required");
        }

        Project releasePlanProject = releasePlan.getProject();
        Project userStoryProject = userStory.getProject();

        if (releasePlanProject == null) {
            throw new IllegalStateException("Release plan is missing an associated project");
        }
        if (userStoryProject == null) {
            throw new IllegalStateException("User story is missing an associated project");
        }

        if (!userStoryProject.getId().equals(releasePlanProject.getId())) {
            throw new IllegalArgumentException("User story must belong to the same project as the release plan");
        }

        userStory.setReleasePlan(releasePlan);
        userStoryRepo.save(userStory);

        return toResponseDTO(releasePlan);
    }

    private ReleasePlanResponseDTO toResponseDTO(ReleasePlan releasePlan) {
        ReleasePlanResponseDTO dto = new ReleasePlanResponseDTO();
        dto.setId(releasePlan.getId());
        dto.setReleaseKey(releasePlan.getReleaseKey());
        dto.setName(releasePlan.getName());
        dto.setDescription(releasePlan.getDescription());
        dto.setGoals(releasePlan.getGoals());
        dto.setStartDate(releasePlan.getStartDate());
        dto.setTargetDate(releasePlan.getTargetDate());
        dto.setStatus(releasePlan.getStatus());
        dto.setCreatedAt(releasePlan.getCreatedAt());
        dto.setUpdatedAt(releasePlan.getUpdatedAt());

        if (releasePlan.getProject() != null) {
            dto.setProjectId(releasePlan.getProject().getId());
            dto.setProjectName(releasePlan.getProject().getName());
        }

        if (releasePlan.getCreatedBy() != null) {
            dto.setCreatedByUserId(releasePlan.getCreatedBy().getId());
            dto.setCreatedByUsername(releasePlan.getCreatedBy().getUsername());
        }

        if (releasePlan.getUserStories() != null) {
            dto.setUserStoryCount(releasePlan.getUserStories().size());
        } else {
            dto.setUserStoryCount(0);
        }

        return dto;
    }
}
