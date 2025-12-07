package com.asu.ser515.agiletool.repository;

import com.asu.ser515.agiletool.models.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectKey(String projectKey);
    boolean existsByProjectKey(String projectKey);

    Optional<Project> findByProjectCode(String projectCode);
    boolean existsByProjectCode(String projectCode);

    List<Project> findByMembers_Username(String username);
}
