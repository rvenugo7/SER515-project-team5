package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.models.*;
import com.asu.ser515.agiletool.repository.ProjectRepository;
import com.asu.ser515.agiletool.repository.UserStoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class UserStoryService {

    private final UserStoryRepository storyRepo;
    private final ProjectRepository projectRepo;

    public UserStoryService(UserStoryRepository storyRepo, ProjectRepository projectRepo) {
        this.storyRepo = storyRepo;
        this.projectRepo = projectRepo;
    }

    private static final String GLOBAL_KEY = "GLOBAL";
    private static final long GLOBAL_PROJECT_ID = 1L;
    private static final int PAD = 3;

    @Transactional
    public UserStory create(String title,
                            String description,
                            String acceptanceCriteria,
                            Integer businessValue,
                            StoryPriority priority) {

        if (title == null || title.isBlank())
            throw new IllegalArgumentException("Title is required");
        if (description == null || description.isBlank())
            throw new IllegalArgumentException("Description is required");

        Project project = projectRepo.findById(GLOBAL_PROJECT_ID)
                .orElseThrow(() -> new IllegalStateException("GLOBAL project missing — seed it first"));

        UserStory s = new UserStory();
        s.setProject(project);
        s.setTitle(title);
        s.setDescription(description);
        s.setAcceptanceCriteria(acceptanceCriteria);
        s.setBusinessValue(businessValue);
        s.setPriority(priority == null ? StoryPriority.MEDIUM : priority);
        s.setStatus(StoryStatus.NEW);

        s = storyRepo.save(s);

        String storyKey = GLOBAL_KEY + "-" + String.format("%0" + PAD + "d", s.getId());
        s.setStoryKey(storyKey);

        return storyRepo.save(s);
    }

    @Transactional(readOnly = true)
    public List<UserStory> listAll() {
        return storyRepo.findAllByOrderByIdAsc();
    }

    @Transactional
    public UserStory updateUserStory(Long id,
                                    String title,
                                    String description,
                                    String acceptanceCriteria,
                                    Integer businessValue,
                                    StoryPriority priority) {
        UserStory story = storyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User Story not found with id: " + id));

        if (title == null || title.isBlank())
            throw new IllegalArgumentException("Title is required");
        if (description == null || description.isBlank())
            throw new IllegalArgumentException("Description is required");

        story.setTitle(title);
        story.setDescription(description);
        story.setAcceptanceCriteria(acceptanceCriteria);
        story.setBusinessValue(businessValue);
        if (priority != null) {
            story.setPriority(priority);
        }

        return storyRepo.save(story);
    }

    @Transactional
    public void deleteUserStory(Long id) {
        UserStory story = storyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User Story not found with id: " + id));

        // Delete the user story (associated tasks will be deleted automatically due to orphanRemoval = true)
        storyRepo.delete(story);
    }

    @Transactional
    public UserStory updateEstimation(Long storyId, int storyPoints) {
    UserStory story = storyRepo.findById(storyId)
            .orElseThrow(() -> new RuntimeException("User Story not found with id: " + storyId));

    story.setStoryPoints(storyPoints);

    return storyRepo.save(story);   
    }

    @Transactional
    public UserStory updateStatus(Long id, StoryStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }

        UserStory story = storyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User Story not found with id: " + id));

        story.setStatus(status);

        return storyRepo.save(story);
    }
}
