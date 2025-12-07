package com.asu.ser515.agiletool.repository;

import com.asu.ser515.agiletool.models.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, Long> {
    List<UserStory> findAllByOrderByIdAsc();
    List<UserStory> findAllByProjectIdOrderByIdAsc(Long projectId);
}
