package com.asu.ser515.agiletool.dto;

public class EstimateRequest {
    private int storyPoints;

    public EstimateRequest() {}

    public EstimateRequest(int storyPoints){
        this.storyPoints = storyPoints;
    }

    public int getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(int storyPoints){
        this.storyPoints = storyPoints;
    }
}
