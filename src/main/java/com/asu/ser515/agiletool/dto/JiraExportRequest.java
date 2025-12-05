package com.asu.ser515.agiletool.dto;

public class JiraExportRequest {
    private String baseUrl;
    private String userEmail;
    private String apiToken;
    private String projectKey;
    private String issueTypeId;
    private String storyPointsFieldId;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getApiToken() {
        return apiToken;
    }

    public void setApiToken(String apiToken) {
        this.apiToken = apiToken;
    }

    public String getProjectKey() {
        return projectKey;
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public String getIssueTypeId() {
        return issueTypeId;
    }

    public void setIssueTypeId(String issueTypeId) {
        this.issueTypeId = issueTypeId;
    }

    public String getStoryPointsFieldId() {
        return storyPointsFieldId;
    }

    public void setStoryPointsFieldId(String storyPointsFieldId) {
        this.storyPointsFieldId = storyPointsFieldId;
    }

    public boolean hasCredentials() {
        return isNotBlank(baseUrl)
                && isNotBlank(userEmail)
                && isNotBlank(apiToken)
                && isNotBlank(projectKey)
                && isNotBlank(issueTypeId);
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
