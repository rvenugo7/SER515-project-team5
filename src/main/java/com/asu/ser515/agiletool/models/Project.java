package com.asu.ser515.agiletool.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "projects")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "Project name is required")
    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(unique = true, nullable = false, length = 50)
    private String projectKey;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProjectMember> projectMembers = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ReleasePlan> releasePlans = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserStory> userStories = new HashSet<>();

    public Set<User> getMembers() {
        return projectMembers.stream()
                .map(ProjectMember::getUser)
                .distinct()
                .collect(Collectors.toSet());
    }

    public Set<User> getMembersWithRole(UserRole role) {
        return projectMembers.stream()
                .filter(pm -> pm.getRole().equals(role))
                .map(ProjectMember::getUser)
                .collect(Collectors.toSet());
    }

    public boolean hasUserWithRole(Long userId, UserRole role) {
        return projectMembers.stream()
                .anyMatch(pm -> pm.getUser().getId().equals(userId) && pm.getRole().equals(role));
    }

    public void addMember(User user, UserRole role) {
        ProjectMember pm = new ProjectMember();
        pm.setProject(this);
        pm.setUser(user);
        pm.setRole(role);
        projectMembers.add(pm);
    }
}
