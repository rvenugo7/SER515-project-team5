package com.asu.ser515.agiletool.controller;

import com.asu.ser515.agiletool.models.*;
import com.asu.ser515.agiletool.service.UserStoryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {
    private final UserStoryService userStoryService;
    public StoryController(UserStoryService userStoryService) { this.userStoryService = userStoryService; }

    @PostMapping
    public ResponseEntity<CreateStoryRes> create(@RequestBody CreateStoryReq req) {
        UserStory s = userStoryService.create(
            req.getTitle(), req.getDescription(), req.getAcceptanceCriteria(),
            req.getBusinessValue(), req.getPriority()
        );
        return ResponseEntity.status(201).body(new CreateStoryRes("User Story created successfully", s));
    }

    @GetMapping
    public List<UserStory> list() { return userStoryService.listAll(); }

    public static class CreateStoryReq {
        private String title, description, acceptanceCriteria;
        private Integer businessValue;
        private StoryPriority priority;
        public String getTitle() { return title; } public void setTitle(String v){title=v;}
        public String getDescription(){return description;} public void setDescription(String v){description=v;}
        public String getAcceptanceCriteria(){return acceptanceCriteria;} public void setAcceptanceCriteria(String v){acceptanceCriteria=v;}
        public Integer getBusinessValue(){return businessValue;} public void setBusinessValue(Integer v){businessValue=v;}
        public StoryPriority getPriority(){return priority;} public void setPriority(StoryPriority v){priority=v;}
    }
    public static class CreateStoryRes {
        private String message; private UserStory story;
        public CreateStoryRes() {} public CreateStoryRes(String m, UserStory s){message=m;story=s;}
        public String getMessage(){return message;} public void setMessage(String v){message=v;}
        public UserStory getStory(){return story;} public void setStory(UserStory v){story=v;}
    }
}