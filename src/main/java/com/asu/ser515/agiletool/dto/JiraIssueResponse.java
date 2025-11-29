package com.asu.ser515.agiletool.dto;

/**
 * Lightweight response returned after exporting a story to JIRA.
 */
public class JiraIssueResponse {
    private String issueId;
    private String issueKey;
    private String selfUrl;
    private String browseUrl;
    private String status;

    public JiraIssueResponse() {}

    public JiraIssueResponse(String issueId, String issueKey, String selfUrl, String browseUrl, String status) {
        this.issueId = issueId;
        this.issueKey = issueKey;
        this.selfUrl = selfUrl;
        this.browseUrl = browseUrl;
        this.status = status;
    }

    public String getIssueId() {
        return issueId;
    }

    public void setIssueId(String issueId) {
        this.issueId = issueId;
    }

    public String getIssueKey() {
        return issueKey;
    }

    public void setIssueKey(String issueKey) {
        this.issueKey = issueKey;
    }

    public String getSelfUrl() {
        return selfUrl;
    }

    public void setSelfUrl(String selfUrl) {
        this.selfUrl = selfUrl;
    }

    public String getBrowseUrl() {
        return browseUrl;
    }

    public void setBrowseUrl(String browseUrl) {
        this.browseUrl = browseUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
