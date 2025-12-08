// Utility functions for role-based permission checks

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  roles: string[];
  active: boolean;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRoles: string[], allowedRoles: string[]): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return allowedRoles.some(role => userRoles.includes(role));
}

/**
 * Check if user can create/edit/delete user stories
 * Requires: PRODUCT_OWNER or SYSTEM_ADMIN
 */
export function canManageStories(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ['PRODUCT_OWNER', 'SYSTEM_ADMIN']);
}

/**
 * Check if user can estimate story points
 * Requires: DEVELOPER, SCRUM_MASTER, PRODUCT_OWNER, or SYSTEM_ADMIN
 */
export function canEstimateStories(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ['DEVELOPER', 'SCRUM_MASTER', 'PRODUCT_OWNER', 'SYSTEM_ADMIN']);
}

/**
 * Check if user can update story status
 * Requires: DEVELOPER, SCRUM_MASTER, PRODUCT_OWNER, or SYSTEM_ADMIN
 */
export function canUpdateStoryStatus(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ['DEVELOPER', 'SCRUM_MASTER', 'PRODUCT_OWNER', 'SYSTEM_ADMIN']);
}

/**
 * Check if user can mark stories as sprint ready
 * Requires: PRODUCT_OWNER, SCRUM_MASTER, or SYSTEM_ADMIN
 */
export function canMarkSprintReady(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ['PRODUCT_OWNER', 'SCRUM_MASTER', 'SYSTEM_ADMIN']);
}

/**
 * Check if user can link stories to release plans
 * Requires: PRODUCT_OWNER or SYSTEM_ADMIN
 */
export function canLinkToReleasePlan(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ['PRODUCT_OWNER', 'SYSTEM_ADMIN']);
}

/**
 * Fetch current user from API
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/users/me", {
      credentials: "include",
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

