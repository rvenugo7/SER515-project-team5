package com.asu.ser515.agiletool.security;

import com.asu.ser515.agiletool.models.UserRole;
import com.asu.ser515.agiletool.repository.ProjectMemberRepository;
import com.asu.ser515.agiletool.repository.UserRepository;
import org.springframework.security.access.expression.SecurityExpressionRoot;
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations;
import org.springframework.security.core.Authentication;
import java.util.List;

public class CustomMethodSecurityExpressionRoot extends SecurityExpressionRoot
        implements MethodSecurityExpressionOperations {

    private Object filterObject;
    private Object returnObject;
    private ProjectMemberRepository projectMemberRepository;
    private UserRepository userRepository;

    public CustomMethodSecurityExpressionRoot(Authentication authentication) {
        super(authentication);
    }

    public void setProjectMemberRepository(ProjectMemberRepository repo) {
        this.projectMemberRepository = repo;
    }

    public void setUserRepository(UserRepository repo) {
        this.userRepository = repo;
    }

    public boolean hasRoleInProject(Long projectId, String roleName) {
        String username = getAuthentication().getName();
        return userRepository.findByUsername(username)
            .map(user -> {
                if (user.isSystemAdmin()) {
                    return true;
                }

                UserRole role = UserRole.valueOf(roleName);
                List<UserRole> roles = projectMemberRepository
                    .findRolesByProjectIdAndUserId(projectId, user.getId());
                return roles.contains(role);
            })
            .orElse(false);
    }

    public boolean hasAnyRoleInProject(Long projectId, String... roleNames) {
        String username = getAuthentication().getName();
        return userRepository.findByUsername(username)
            .map(user -> {
                if (user.isSystemAdmin()) {
                    return true;
                }

                List<UserRole> userRoles = projectMemberRepository
                    .findRolesByProjectIdAndUserId(projectId, user.getId());

                for (String roleName : roleNames) {
                    UserRole role = UserRole.valueOf(roleName);
                    if (userRoles.contains(role)) {
                        return true;
                    }
                }
                return false;
            })
            .orElse(false);
    }

    public boolean isMemberOfProject(Long projectId) {
        String username = getAuthentication().getName();
        return userRepository.findByUsername(username)
            .map(user -> {
                if (user.isSystemAdmin()) {
                    return true;
                }
                return projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId());
            })
            .orElse(false);
    }

    @Override
    public void setFilterObject(Object filterObject) {
        this.filterObject = filterObject;
    }

    @Override
    public Object getFilterObject() {
        return filterObject;
    }

    @Override
    public void setReturnObject(Object returnObject) {
        this.returnObject = returnObject;
    }

    @Override
    public Object getReturnObject() {
        return returnObject;
    }

    @Override
    public Object getThis() {
        return this;
    }
}
