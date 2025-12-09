package com.asu.ser515.agiletool.config;

import com.asu.ser515.agiletool.models.*;
import com.asu.ser515.agiletool.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ReleasePlanRepository releasePlanRepository;

    @Autowired
    private UserStoryRepository userStoryRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createDefaultAdminAccount();
        migrateProjectCodes();
        createMockData();
    }

    private void migrateProjectCodes() {
        List<Project> projects = projectRepository.findAll();
        for (Project p : projects) {
            if (p.getProjectCode() == null || p.getProjectCode().isEmpty()) {
                p.setProjectCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                projectRepository.save(p);
                System.out.println("Generated code for project " + p.getName() + ": " + p.getProjectCode());
            }
        }
    }

    private void createDefaultAdminAccount() {
        // Check if admin account already exists
        if (userRepository.findByUsername("admin").isPresent()) {
            System.out.println("Default admin account already exists");
            return;
        }

        // Create default admin account
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@agiletool.com");
        admin.setPassword(passwordEncoder.encode("admin"));
        admin.setFullName("System Administrator");
        admin.setActive(true);

        // Set SYSTEM_ADMIN role
        Set<UserRole> systemRoles = new HashSet<>();
        systemRoles.add(UserRole.SYSTEM_ADMIN);
        admin.setRoles(systemRoles);

        userRepository.save(admin);
        System.out.println("Default admin account created successfully");
        System.out.println("Username: admin");
        System.out.println("Password: admin");
        System.out.println("IMPORTANT: Please change the default password after first login!");
    }

    private void createMockData() {
        // Check if mock data already exists
        if (projectRepository.findByProjectKey("DEMO").isPresent()) {
            System.out.println("Mock data already exists");
            return;
        }

        // Create users
        User po = createUser("jsmith", "jsmith@example.com", "John Smith", UserRole.PRODUCT_OWNER);
        User sm = createUser("mwilson", "mwilson@example.com", "Maria Wilson", UserRole.SCRUM_MASTER);
        User dev = createUser("alee", "alee@example.com", "Alex Lee", UserRole.DEVELOPER);

        // Create project
        Project project = new Project();
        project.setName("Demo Project");
        project.setProjectKey("DEMO");
        project.setProjectCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        project.setDescription("Sample agile project");
        project.setActive(true);
        project = projectRepository.save(project);

        // Add project members
        addProjectMember(project, po, UserRole.PRODUCT_OWNER);
        addProjectMember(project, sm, UserRole.SCRUM_MASTER);
        addProjectMember(project, dev, UserRole.DEVELOPER);

        // Create release plans
        ReleasePlan release1 = createReleasePlan(project, po, "Release 1.0", "MVP features",
                LocalDate.of(2025, 1, 1), LocalDate.of(2025, 3, 31));
        ReleasePlan release2 = createReleasePlan(project, po, "Release 2.0", "Enhanced features",
                LocalDate.of(2025, 4, 1), LocalDate.of(2025, 6, 30));

        // Create user stories with varied statuses for scrum board
        createUserStory(project, po, release1, "User Login", "user", "to log in", "I can access my account", 3, StoryPriority.HIGH, StoryStatus.DONE, true, true);
        createUserStory(project, po, release1, "Dashboard View", "user", "to see a dashboard", "I can track progress", 5, StoryPriority.MEDIUM, StoryStatus.IN_PROGRESS, true, true);
        createUserStory(project, po, release2, "Export Data", "admin", "to export data", "I can create reports", 8, StoryPriority.LOW, StoryStatus.NEW, true, false);
        createUserStory(project, po, release2, "Email Notifications", "user", "to receive email alerts", "I stay informed", 3, StoryPriority.MEDIUM, StoryStatus.NEW, false, false);

        System.out.println("Mock data created successfully");
    }

    private User createUser(String username, String email, String fullName, UserRole role) {
        if (userRepository.findByUsername(username).isPresent()) {
            return userRepository.findByUsername(username).get();
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode("password123"));
        user.setActive(true);
        Set<UserRole> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);
        return userRepository.save(user);
    }

    private void addProjectMember(Project project, User user, UserRole role) {
        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setRole(role);
        projectMemberRepository.save(member);
    }

    private ReleasePlan createReleasePlan(Project project, User createdBy, String name, String goals,
                                          LocalDate startDate, LocalDate targetDate) {
        ReleasePlan plan = new ReleasePlan();
        plan.setProject(project);
        plan.setCreatedBy(createdBy);
        plan.setName(name);
        plan.setGoals(goals);
        plan.setStartDate(startDate);
        plan.setTargetDate(targetDate);
        plan.setStatus(ReleaseStatus.PLANNED);
        plan.setReleaseKey(project.getProjectKey() + "-R" + System.currentTimeMillis() % 1000);
        return releasePlanRepository.save(plan);
    }

    private void createUserStory(Project project, User createdBy, ReleasePlan releasePlan,
                                 String title, String asA, String iWant, String soThat,
                                 int storyPoints, StoryPriority priority, StoryStatus status,
                                 boolean sprintReady, boolean isMvp) {
        UserStory story = new UserStory();
        story.setProject(project);
        story.setCreatedBy(createdBy);
        story.setReleasePlan(releasePlan);
        story.setTitle(title);
        story.setAsA(asA);
        story.setIWant(iWant);
        story.setSoThat(soThat);
        story.setStoryPoints(storyPoints);
        story.setPriority(priority);
        story.setStatus(status);
        story.setSprintReady(sprintReady);
        story.setIsMvp(isMvp);
        story.setStoryKey(project.getProjectKey() + "-" + System.currentTimeMillis() % 10000);
        userStoryRepository.save(story);
    }
}
