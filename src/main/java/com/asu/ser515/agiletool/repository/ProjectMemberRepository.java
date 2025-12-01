package com.asu.ser515.agiletool.repository;

import com.asu.ser515.agiletool.models.ProjectMember;
import com.asu.ser515.agiletool.models.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProjectId(Long projectId);

    List<ProjectMember> findByUserId(Long userId);

    List<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    Optional<ProjectMember> findByProjectIdAndUserIdAndRole(Long projectId, Long userId, UserRole role);

    void deleteByProjectIdAndUserIdAndRole(Long projectId, Long userId, UserRole role);

    void deleteByProjectIdAndUserId(Long projectId, Long userId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    @Query("SELECT DISTINCT pm.role FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId")
    List<UserRole> findRolesByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);
}
