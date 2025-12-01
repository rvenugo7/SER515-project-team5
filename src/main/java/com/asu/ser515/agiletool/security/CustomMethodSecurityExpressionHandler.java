package com.asu.ser515.agiletool.security;

import com.asu.ser515.agiletool.repository.ProjectMemberRepository;
import com.asu.ser515.agiletool.repository.UserRepository;
import org.aopalliance.intercept.MethodInvocation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class CustomMethodSecurityExpressionHandler extends DefaultMethodSecurityExpressionHandler {

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected MethodSecurityExpressionOperations createSecurityExpressionRoot(
            Authentication authentication, MethodInvocation invocation) {

        CustomMethodSecurityExpressionRoot root =
            new CustomMethodSecurityExpressionRoot(authentication);
        root.setProjectMemberRepository(projectMemberRepository);
        root.setUserRepository(userRepository);
        root.setPermissionEvaluator(getPermissionEvaluator());
        root.setTrustResolver(getTrustResolver());
        root.setRoleHierarchy(getRoleHierarchy());

        return root;
    }
}
