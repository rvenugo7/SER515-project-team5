package com.asu.ser515.agiletool.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UserProfileUpdateDTO {

    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    public UserProfileUpdateDTO() {
    }

    public UserProfileUpdateDTO(String fullName, String email) {
        this.fullName = fullName;
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
