package com.asu.ser515.agiletool.service;

import com.asu.ser515.agiletool.dto.JiraIssueResponse;
import com.asu.ser515.agiletool.models.StoryPriority;
import com.asu.ser515.agiletool.models.UserStory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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

    private final RestTemplateBuilder restTemplateBuilder;
    private final JiraConfig defaultConfig;

    public JiraService(RestTemplateBuilder restTemplateBuilder,
                       @Value("${jira.base-url:}") String baseUrl,
                       @Value("${jira.user-email:}") String userEmail,
                       @Value("${jira.api-token:}") String apiToken,
                       @Value("${jira.project-key:}") String projectKey,
                       @Value("${jira.issue-type-id:}") String issueTypeId,
                       @Value("${jira.story-points-field-id:customfield_10016}") String storyPointsFieldId) {
        this.restTemplateBuilder = restTemplateBuilder;
        this.defaultConfig = new JiraConfig(
                baseUrl,
                userEmail,
                apiToken,
                projectKey,
                issueTypeId,
                storyPointsFieldId
        );
    }

    public JiraIssueResponse createIssueFromStory(UserStory story) {
        return createIssueFromStory(story, defaultConfig);
    }

    public JiraIssueResponse createIssueFromStory(UserStory story, JiraConfig overrideConfig) {
        JiraConfig effectiveConfig = overrideConfig == null
                ? defaultConfig
                : overrideConfig.merge(defaultConfig);
        return createIssue(story, effectiveConfig);
    }

    private JiraIssueResponse createIssue(UserStory story, JiraConfig config) {
        validateBaseConfiguration(config);
        JiraConfig resolvedConfig = resolveConfigWithMetadata(config);

        HttpHeaders headers = buildAuthHeaders(resolvedConfig);

        Map<String, Object> payload = buildIssuePayload(story, resolvedConfig);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

        try {
            RestTemplate restTemplate = restTemplateBuilder
                    .rootUri(resolvedConfig.getBaseUrl())
                    .build();

            ResponseEntity<Map> response = restTemplate.postForEntity("/rest/api/3/issue", requestEntity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String issueId = body.get("id") != null ? body.get("id").toString() : null;
                String issueKey = body.get("key") != null ? body.get("key").toString() : null;
                String self = body.get("self") != null ? body.get("self").toString() : null;
                String browseUrl = StringUtils.hasText(issueKey) && StringUtils.hasText(resolvedConfig.getBaseUrl())
                        ? resolvedConfig.getBaseUrl() + "/browse/" + issueKey
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

    private Map<String, Object> buildIssuePayload(UserStory story, JiraConfig config) {
        Map<String, Object> fields = new HashMap<>();

        fields.put("project", Map.of("key", config.getProjectKey()));
        fields.put("issuetype", Map.of("id", config.getIssueTypeId()));
        fields.put("summary", story.getTitle());
        fields.put("description", buildDescriptionDocument(story));

        if (story.getPriority() != null) {
            fields.put("priority", Map.of("name", mapPriority(story.getPriority())));
        }

        if (story.getStoryPoints() != null && StringUtils.hasText(config.getStoryPointsFieldId())) {
            fields.put(config.getStoryPointsFieldId(), story.getStoryPoints());
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

    private void validateBaseConfiguration(JiraConfig config) {
        if (!StringUtils.hasText(config.getBaseUrl())
                || !StringUtils.hasText(config.getUserEmail())
                || !StringUtils.hasText(config.getApiToken())
                || !StringUtils.hasText(config.getProjectKey())) {
            throw new IllegalStateException("JIRA integration is not configured. Please set jira.base-url, jira.user-email, jira.api-token, and jira.project-key properties.");
        }
    }

    private HttpHeaders buildAuthHeaders(JiraConfig config) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(config.getUserEmail(), config.getApiToken());
        return headers;
    }

    private JiraConfig resolveConfigWithMetadata(JiraConfig config) {
        RestTemplate restTemplate = restTemplateBuilder
                .rootUri(config.getBaseUrl())
                .build();
        HttpHeaders headers = buildAuthHeaders(config);

        String issueTypeId = StringUtils.hasText(config.getIssueTypeId())
                ? config.getIssueTypeId()
                : fetchIssueTypeId(restTemplate, headers, config.getProjectKey());

        String storyPointsFieldId = StringUtils.hasText(config.getStoryPointsFieldId())
                ? config.getStoryPointsFieldId()
                : fetchStoryPointsFieldId(restTemplate, headers);

        return new JiraConfig(
                config.getBaseUrl(),
                config.getUserEmail(),
                config.getApiToken(),
                config.getProjectKey(),
                issueTypeId,
                storyPointsFieldId
        );
    }

    private String fetchIssueTypeId(RestTemplate restTemplate, HttpHeaders headers, String projectKey) {
        String path = String.format("/rest/api/3/issue/createmeta?projectKeys=%s&expand=projects.issuetypes", projectKey);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    path, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            Map<String, Object> body = response.getBody();
            if (body == null || body.get("projects") == null) {
                throw new IllegalStateException("JIRA createmeta response is missing project information.");
            }
            List<Map<String, Object>> projects = (List<Map<String, Object>>) body.get("projects");
            if (projects.isEmpty()) {
                throw new IllegalStateException("No projects found for the provided project key.");
            }
            List<Map<String, Object>> issueTypes = (List<Map<String, Object>>) projects.get(0).get("issuetypes");
            if (issueTypes == null || issueTypes.isEmpty()) {
                throw new IllegalStateException("No issue types returned for the project.");
            }
            for (Map<String, Object> issueType : issueTypes) {
                String name = issueType.get("name") != null ? issueType.get("name").toString() : "";
                if ("story".equalsIgnoreCase(name) || "user story".equalsIgnoreCase(name)) {
                    return issueType.get("id").toString();
                }
            }
            Object fallbackId = issueTypes.get(0).get("id");
            if (fallbackId != null) {
                return fallbackId.toString();
            }
            throw new IllegalStateException("Unable to determine issue type ID from JIRA metadata.");
        } catch (RestClientResponseException ex) {
            throw new IllegalStateException(
                    "Failed to fetch JIRA issue types: " + ex.getStatusText() + " - " + ex.getResponseBodyAsString(), ex);
        } catch (RestClientException ex) {
            throw new IllegalStateException("Error calling JIRA API for issue types: " + ex.getMessage(), ex);
        }
    }

    private String fetchStoryPointsFieldId(RestTemplate restTemplate, HttpHeaders headers) {
        try {
            ResponseEntity<List> response = restTemplate.exchange(
                    "/rest/api/3/field", HttpMethod.GET, new HttpEntity<>(headers), List.class);
            List<Map<String, Object>> fields = response.getBody();
            if (fields == null || fields.isEmpty()) {
                throw new IllegalStateException("No JIRA fields returned when looking up Story Points.");
            }
            for (Map<String, Object> field : fields) {
                String name = field.get("name") != null ? field.get("name").toString() : "";
                if (name.toLowerCase().contains("story point")) {
                    return field.get("id").toString();
                }
            }
            throw new IllegalStateException("Unable to determine Story Points field ID from JIRA metadata.");
        } catch (RestClientResponseException ex) {
            throw new IllegalStateException(
                    "Failed to fetch JIRA fields: " + ex.getStatusText() + " - " + ex.getResponseBodyAsString(), ex);
        } catch (RestClientException ex) {
            throw new IllegalStateException("Error calling JIRA API for fields: " + ex.getMessage(), ex);
        }
    }

    public static class JiraConfig {
        private final String baseUrl;
        private final String userEmail;
        private final String apiToken;
        private final String projectKey;
        private final String issueTypeId;
        private final String storyPointsFieldId;

        public JiraConfig(String baseUrl,
                          String userEmail,
                          String apiToken,
                          String projectKey,
                          String issueTypeId,
                          String storyPointsFieldId) {
            this.baseUrl = baseUrl;
            this.userEmail = userEmail;
            this.apiToken = apiToken;
            this.projectKey = projectKey;
            this.issueTypeId = issueTypeId;
            this.storyPointsFieldId = storyPointsFieldId;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public String getUserEmail() {
            return userEmail;
        }

        public String getApiToken() {
            return apiToken;
        }

        public String getProjectKey() {
            return projectKey;
        }

        public String getIssueTypeId() {
            return issueTypeId;
        }

        public String getStoryPointsFieldId() {
            return storyPointsFieldId;
        }

        public JiraConfig merge(JiraConfig fallback) {
            if (fallback == null) {
                return this;
            }
            return new JiraConfig(
                    StringUtils.hasText(this.baseUrl) ? this.baseUrl : fallback.baseUrl,
                    StringUtils.hasText(this.userEmail) ? this.userEmail : fallback.userEmail,
                    StringUtils.hasText(this.apiToken) ? this.apiToken : fallback.apiToken,
                    StringUtils.hasText(this.projectKey) ? this.projectKey : fallback.projectKey,
                    StringUtils.hasText(this.issueTypeId) ? this.issueTypeId : fallback.issueTypeId,
                    StringUtils.hasText(this.storyPointsFieldId) ? this.storyPointsFieldId : fallback.storyPointsFieldId
            );
        }
    }
}
