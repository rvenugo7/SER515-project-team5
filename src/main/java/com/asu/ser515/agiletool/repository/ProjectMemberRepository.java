package com.asu.ser515.agiletool.repository;

import com.asu.ser515.agiletool.models.ProjectMember;
import com.asu.ser515.agiletool.models.Project;
import com.asu.ser515.agiletool.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProject(Project project);
    List<ProjectMember> findByProjectId(Long projectId);
    Optional<ProjectMember> findByProjectAndUserAndRole(Project project, User user, com.asu.ser515.agiletool.models.UserRole role);
    boolean existsByProjectAndUserAndRole(Project project, User user, com.asu.ser515.agiletool.models.UserRole role);
}

