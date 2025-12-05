package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.dto.JiraIssueResponse;
import com.asu.ser515.agiletool.models.*;
import com.asu.ser515.agiletool.repository.ProjectRepository;
import com.asu.ser515.agiletool.repository.UserRepository;
import com.asu.ser515.agiletool.repository.UserStoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserStoryService {

    private final UserStoryRepository storyRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final JiraService jiraService;

    public UserStoryService(UserStoryRepository storyRepo, ProjectRepository projectRepo, 
                           UserRepository userRepo, JiraService jiraService) {
        this.storyRepo = storyRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.jiraService = jiraService;
    }

    private static final String GLOBAL_KEY = "GLOBAL";
    private static final long GLOBAL_PROJECT_ID = 1L;
    private static final int PAD = 3;

    /**
     * Checks if a user is a member of a project.
     * @param username The username of the user to check
     * @param projectId The ID of the project to check membership for
     * @return true if the user is a member of the project, false otherwise
     * @throws IllegalStateException if the user or project is not found
     */
    private boolean isUserProjectMember(String username, Long projectId) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found with username: " + username));
        
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new IllegalStateException("Project not found with ID: " + projectId));
        
        return project.getMembers().contains(user);
    }

    /**
     * Checks if a user has permission to view user stories for a project.
     * Throws an exception if the user is not a project member.
     * @param username The username of the user to check
     * @param projectId The ID of the project to check permissions for
     * @throws SecurityException if the user is not a project member
     */
    private void checkProjectPermission(String username, Long projectId) {
        if (!isUserProjectMember(username, projectId)) {
            throw new SecurityException("Access denied: You are not a member of this project");
        }
    }

    @Transactional
    public UserStory create(String title,
                            String description,
                            String acceptanceCriteria,
                            Integer businessValue,
                            StoryPriority priority,
                            Long projectId) {

        if (title == null || title.isBlank())
            throw new IllegalArgumentException("Title is required");
        if (description == null || description.isBlank())
            throw new IllegalArgumentException("Description is required");

        // Use provided projectId or fall back to GLOBAL_PROJECT_ID
        Long targetProjectId = projectId != null ? projectId : GLOBAL_PROJECT_ID;
        Project project = projectRepo.findById(targetProjectId)
                .orElseThrow(() -> new IllegalStateException("Project not found with ID: " + targetProjectId));

        UserStory s = new UserStory();
        s.setProject(project);
        s.setTitle(title);
        s.setDescription(description);
        s.setAcceptanceCriteria(acceptanceCriteria);
        s.setBusinessValue(businessValue);
        s.setPriority(priority == null ? StoryPriority.MEDIUM : priority);
        s.setStatus(StoryStatus.NEW);

        s = storyRepo.save(s);

        // Generate story key based on project key
        String projectKey = project.getProjectKey() != null ? project.getProjectKey() : GLOBAL_KEY;
        String storyKey = projectKey + "-" + String.format("%0" + PAD + "d", s.getId());
        s.setStoryKey(storyKey);

        return storyRepo.save(s);
    }

    @Transactional(readOnly = true)
    public List<UserStory> listAll(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found with username: " + username));
        
        // Filter stories to only include those from projects where the user is a member
        return storyRepo.findAllByOrderByIdAsc().stream()
                .filter(story -> {
                    Project project = story.getProject();
                    return project != null && project.getMembers().contains(user);
                })
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<UserStory> listByProjectId(Long projectId, String username) {
        checkProjectPermission(username, projectId);
        return storyRepo.findByProjectIdOrderByIdAsc(projectId);
    }

    @Transactional
    public UserStory updateUserStory(Long id,
                                    String title,
                                    String description,
                                    String acceptanceCriteria,
                                    Integer businessValue,
                                    StoryPriority priority,
                                    String username) {
        UserStory story = getStoryById(id, username);

        if (title == null || title.isBlank())
            throw new IllegalArgumentException("Title is required");
        if (description == null || description.isBlank())
            throw new IllegalArgumentException("Description is required");

        story.setTitle(title);
        story.setDescription(description);
        story.setAcceptanceCriteria(acceptanceCriteria);
        story.setBusinessValue(businessValue);
        // Note: Priority is only updated if explicitly provided (not null).
        // This allows partial updates where priority remains unchanged if not specified.
        if (priority != null) {
            story.setPriority(priority);
        }

        return storyRepo.save(story);
    }

    @Transactional
    public void deleteUserStory(Long id, String username) {
        UserStory story = getStoryById(id, username);

        // Delete the user story (associated tasks will be deleted automatically due to orphanRemoval = true)
        storyRepo.delete(story);
    }

    @Transactional
    public UserStory updateEstimation(Long storyId, int storyPoints, String username) {
        UserStory story = getStoryById(storyId, username);
        story.setStoryPoints(storyPoints);
        return storyRepo.save(story);   
    }

    @Transactional
    public UserStory updateStatus(Long id, StoryStatus status, String username) {
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }

        UserStory story = getStoryById(id, username);
        story.setStatus(status);

        return storyRepo.save(story);
    }

    @Transactional
    public UserStory updateSprintReady(Long id, boolean sprintReady, String username) {
        UserStory story = getStoryById(id, username);
        story.setSprintReady(sprintReady);
        return storyRepo.save(story);
    }

    @Transactional
    public UserStory updateStarred(Long id, boolean starred, String username) {
        UserStory story = getStoryById(id, username);
        story.setIsStarred(starred);
        return storyRepo.save(story);
    }

    @Transactional(readOnly = true)
    public UserStory getStoryById(Long id, String username) {
        UserStory story = storyRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User Story not found with id: " + id));
        
        // Check if user is a member of the project that owns this story
        Project project = story.getProject();
        if (project != null) {
            checkProjectPermission(username, project.getId());
        }
        
        return story;
    }

    @Transactional
    public JiraIssueResponse exportStoryToJira(Long id, String username) {
        UserStory story = getStoryById(id, username);
        return jiraService.createIssueFromStory(story);
    }

    @Transactional
    public UserStory updateMvp(Long id, boolean mvp, String username) {
        UserStory story = getStoryById(id, username);
        story.setIsMvp(mvp);
        return storyRepo.save(story);
    }
}
