package com.asu.ser515.agiletool.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.proxy.HibernateProxy;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_stories")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class UserStory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 500)
    private String title;

    @Column(unique = true, length = 50)
    private String storyKey;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String acceptanceCriteria;
    
    @Column(length = 100)
    private String asA;
    
    @Column(length = 500)
    private String iWant;
    
    @Column(length = 500)
    private String soThat;
    
    @Column
    private Integer storyPoints;
    
    @Column
    private Integer businessValue;
    
    @Column
    private Boolean isMvp = false;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StoryStatus status = StoryStatus.NEW;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StoryPriority priority = StoryPriority.MEDIUM;
    
    @Column
    private Boolean sprintReady = false;

    @Column
    private Boolean isStarred = false;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "release_plan_id")
    private ReleasePlan releasePlan;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column
    private LocalDateTime refinedAt;

    @Column
    private LocalDateTime estimatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "userStory", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Task> tasks = new HashSet<>();

    // Convenience accessors exposed in JSON to show linked release info without the full entity graph
    public Long getReleasePlanId() {
        ReleasePlan rp = unproxyReleasePlan();
        return rp != null ? rp.getId() : null;
    }

    public String getReleasePlanKey() {
        ReleasePlan rp = unproxyReleasePlan();
        return rp != null ? rp.getReleaseKey() : null;
    }

    public String getReleasePlanName() {
        ReleasePlan rp = unproxyReleasePlan();
        return rp != null ? rp.getName() : null;
    }

    private ReleasePlan unproxyReleasePlan() {
        if (releasePlan == null) {
            return null;
        }
        if (releasePlan instanceof HibernateProxy proxy) {
            Object impl = proxy.getHibernateLazyInitializer().getImplementation();
            return impl instanceof ReleasePlan ? (ReleasePlan) impl : null;
        }
        return releasePlan;
    }
}
