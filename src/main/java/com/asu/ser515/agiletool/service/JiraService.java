package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.dto.JiraIssueResponse;
import com.asu.ser515.agiletool.models.StoryPriority;
import com.asu.ser515.agiletool.models.UserStory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JiraService {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String userEmail;
    private final String apiToken;
    private final String projectKey;
    private final String issueTypeId;
    private final String storyPointsFieldId;

    public JiraService(RestTemplateBuilder restTemplateBuilder,
                       @Value("${jira.base-url:}") String baseUrl,
                       @Value("${jira.user-email:}") String userEmail,
                       @Value("${jira.api-token:}") String apiToken,
                       @Value("${jira.project-key:}") String projectKey,
                       @Value("${jira.issue-type-id:}") String issueTypeId,
                       @Value("${jira.story-points-field-id:customfield_10016}") String storyPointsFieldId) {
        this.restTemplate = restTemplateBuilder
                .rootUri(StringUtils.hasText(baseUrl) ? baseUrl : "")
                .build();
        this.baseUrl = baseUrl;
        this.userEmail = userEmail;
        this.apiToken = apiToken;
        this.projectKey = projectKey;
        this.issueTypeId = issueTypeId;
        this.storyPointsFieldId = storyPointsFieldId;
    }

    public JiraIssueResponse createIssueFromStory(UserStory story) {
        validateConfiguration();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(userEmail, apiToken);

        Map<String, Object> payload = buildIssuePayload(story);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity("/rest/api/3/issue", requestEntity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String issueId = body.get("id") != null ? body.get("id").toString() : null;
                String issueKey = body.get("key") != null ? body.get("key").toString() : null;
                String self = body.get("self") != null ? body.get("self").toString() : null;
                String browseUrl = StringUtils.hasText(issueKey) && StringUtils.hasText(baseUrl)
                        ? baseUrl + "/browse/" + issueKey
                        : null;
                return new JiraIssueResponse(issueId, issueKey, self, browseUrl, "CREATED");
            }
            throw new IllegalStateException("Failed to create JIRA issue. Status: " + response.getStatusCode());
        } catch (RestClientResponseException ex) {
            throw new IllegalStateException(
                    "JIRA API error: " + ex.getStatusText() + " - " + ex.getResponseBodyAsString(), ex);
        } catch (RestClientException ex) {
            throw new IllegalStateException("Error calling JIRA API: " + ex.getMessage(), ex);
        }
    }

    private Map<String, Object> buildIssuePayload(UserStory story) {
        Map<String, Object> fields = new HashMap<>();

        fields.put("project", Map.of("key", projectKey));
        fields.put("issuetype", Map.of("id", issueTypeId));
        fields.put("summary", story.getTitle());
        fields.put("description", buildDescriptionDocument(story));

        if (story.getPriority() != null) {
            fields.put("priority", Map.of("name", mapPriority(story.getPriority())));
        }

        if (story.getStoryPoints() != null && StringUtils.hasText(storyPointsFieldId)) {
            fields.put(storyPointsFieldId, story.getStoryPoints());
        }

        return Map.of("fields", fields);
    }

    private Map<String, Object> buildDescriptionDocument(UserStory story) {
        List<Map<String, Object>> content = new ArrayList<>();

        addParagraph(content, "Description: " + orPlaceholder(story.getDescription(), "Not provided."));
        addParagraph(content, "Acceptance Criteria: " + orPlaceholder(story.getAcceptanceCriteria(), "Not provided."));
        addParagraph(content, "User Story: As a " + orPlaceholder(story.getAsA(), "[role]")
                + ", I want " + orPlaceholder(story.getIWant(), "[need]")
                + " so that " + orPlaceholder(story.getSoThat(), "[benefit]"));

        if (story.getBusinessValue() != null) {
            addParagraph(content, "Business Value: " + story.getBusinessValue());
        }

        return Map.of(
                "type", "doc",
                "version", 1,
                "content", content
        );
    }

    private void addParagraph(List<Map<String, Object>> content, String text) {
        Map<String, Object> paragraph = Map.of(
                "type", "paragraph",
                "content", List.of(
                        Map.of(
                                "type", "text",
                                "text", text
                        )
                )
        );
        content.add(paragraph);
    }

    private String orPlaceholder(String value, String placeholder) {
        return StringUtils.hasText(value) ? value : placeholder;
    }

    private String mapPriority(StoryPriority priority) {
        return switch (priority) {
            case CRITICAL -> "Highest";
            case HIGH -> "High";
            case MEDIUM -> "Medium";
            case LOW -> "Low";
        };
    }

    private void validateConfiguration() {
        if (!StringUtils.hasText(baseUrl)
                || !StringUtils.hasText(userEmail)
                || !StringUtils.hasText(apiToken)
                || !StringUtils.hasText(projectKey)
                || !StringUtils.hasText(issueTypeId)) {
            throw new IllegalStateException("JIRA integration is not configured. Please set jira.base-url, jira.user-email, jira.api-token, jira.project-key, and jira.issue-type-id properties.");
        }
    }
}
