package com.asu.ser515.agiletool.models;

public enum UserRole {
    PRODUCT_OWNER("Product Owner"),
    SCRUM_MASTER("Scrum Master"),
    DEVELOPER("Developer"),
    SYSTEM_ADMIN("System Admin");
    
    private final String displayName;
    
    UserRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}