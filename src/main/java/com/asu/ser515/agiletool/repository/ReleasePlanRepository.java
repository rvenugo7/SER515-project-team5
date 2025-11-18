package com.asu.ser515.agiletool.repository;

import com.asu.ser515.agiletool.models.ReleasePlan;
import com.asu.ser515.agiletool.models.ReleaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReleasePlanRepository extends JpaRepository<ReleasePlan, Long> {

    List<ReleasePlan> findByProjectId(Long projectId);
    List<ReleasePlan> findByStatus(ReleaseStatus status);
    Optional<ReleasePlan> findByIdAndProjectId(Long id, Long projectId);
    List<ReleasePlan> findAllByOrderByIdAsc();
    Optional<ReleasePlan> findByReleaseKey(String releaseKey);
    boolean existsByReleaseKey(String releaseKey);
}
