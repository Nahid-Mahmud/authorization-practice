// Import role-based permissions and role hierarchy configuration
import { RoleBasedPermissions, RoleHierarchy } from './config';

/**
 * Represents the context for permission evaluation.
 * - roles: List of roles assigned to the user.
 * - permissions: List of explicit permissions granted to the user.
 */
interface PermissionContext {
  roles: string[];
  permissions: string[];
}

/**
 * PermissionManager provides methods to check user roles and permissions
 * based on a role hierarchy and role-based permissions configuration.
 *
 * It supports:
 * - Role inheritance (hierarchies)
 * - Role-based and explicit permissions
 * - Efficient permission checks via caching
 */
export class PermissionManager {
  // Cache for computed role hierarchies (role -> all inherited roles)
  private readonly cachedRoleHierarchy: Map<string, Set<string>> = new Map();
  // Cache for computed permissions per role (role -> all permissions, including inherited)
  private readonly cachedRolePermissions: Map<string, Set<string>> = new Map();

  /**
   * Initializes the PermissionManager with the given context.
   * Precomputes and caches role hierarchies and permissions for fast lookup.
   * @param context The user's roles and explicit permissions
   */
  constructor(private readonly context: PermissionContext) {
    // Precompute and cache the role hierarchy for each role
    Object.keys(RoleHierarchy).forEach((role) => {
      this.cachedRoleHierarchy.set(role, this.computeRoleHierarchy(role));
    });

    // Precompute and cache permissions for each role
    Object.keys(RoleBasedPermissions).forEach((role) => {
      this.cachedRolePermissions.set(role, this.computePermissions(role));
    });
  }

  /**
   * Recursively computes all roles inherited by the given role (directly and indirectly).
   * Uses a visited set to prevent cycles.
   * @param role The role to compute hierarchy for
   * @param visited Tracks visited roles to avoid infinite loops
   * @returns Set of all inherited roles
   */
  private computeRoleHierarchy(role: string, visited: Set<string> = new Set()) {
    const result = new Set<string>();

    if (visited.has(role)) {
      return result;
    }

    visited.add(role);

    const inheritedRoles = RoleHierarchy[role] || [];
    inheritedRoles.forEach((inheritedRole) => {
      result.add(inheritedRole);

      // Recursively add roles inherited by this inheritedRole
      const inheritedHierarchy = this.computeRoleHierarchy(
        inheritedRole,
        visited,
      );
      inheritedHierarchy.forEach((r) => result.add(r));
    });

    return result;
  }

  /**
   * Computes all permissions for a given role, including those inherited from parent roles.
   * Uses a visited set to prevent cycles.
   * @param role The role to compute permissions for
   * @param visited Tracks visited roles to avoid infinite loops
   * @returns Set of all permissions for the role
   */
  private computePermissions(role: string, visited: Set<string> = new Set()) {
    const result = new Set<string>();

    if (visited.has(role)) {
      return result;
    }

    visited.add(role);

    // Add permissions directly assigned to this role
    RoleBasedPermissions[role]?.forEach((permission) => result.add(permission));
    const hierarchySet = this.cachedRoleHierarchy.get(role);

    // Add permissions from inherited roles
    hierarchySet?.forEach((inheritedRole) => {
      RoleBasedPermissions[inheritedRole]?.forEach((permission) =>
        result.add(permission),
      );
    });

    return result;
  }

  /**
   * Checks if any of the given roles grant the specified permission.
   * @param roles List of roles to check
   * @param permission Permission to check for
   * @returns True if any role grants the permission
   */
  private hasPermissionThroughRole(roles: string[], permission: string) {
    return roles.some((role) =>
      this.cachedRolePermissions.get(role)?.has(permission),
    );
  }

  /**
   * Checks if the user has the specified permission, either explicitly or through their roles.
   * @param requiredPermission The permission to check
   * @returns True if the user has the permission
   */
  public hasPermission(requiredPermission: string): boolean {
    // Check explicit permissions
    if (this.context.permissions.includes(requiredPermission)) {
      return true;
    }

    // Check permissions granted by roles
    return this.hasPermissionThroughRole(
      this.context.roles,
      requiredPermission,
    );
  }

  /**
   * Checks if the user has all of the specified permissions.
   * @param requiredPermissions List of permissions to check
   * @returns True if the user has all permissions
   */
  public hasPermissions(requiredPermissions: string[]): boolean {
    return requiredPermissions.every((permission) =>
      this.hasPermission(permission),
    );
  }

  /**
   * Checks if the user has at least one of the specified permissions.
   * @param requiredPermissions List of permissions to check
   * @returns True if the user has any of the permissions
   */
  public hasAnyPermission(requiredPermissions: string[]): boolean {
    return requiredPermissions.some((permission) =>
      this.hasPermission(permission),
    );
  }

  /**
   * Checks if the user has the specified role, directly or via role inheritance.
   * @param requiredRole The role to check
   * @returns True if the user has the role
   */
  public hasRole = (requiredRole: string): boolean => {
    return this.context.roles.some((role) => {
      const hierarchySet = this.cachedRoleHierarchy.get(role);
      return hierarchySet?.has(requiredRole) || role === requiredRole;
    });
  };

  /**
   * Returns the user's highest (most privileged) role based on the role hierarchy.
   * @returns The maximum role from the user's roles
   */
  public getMaxRole = () => {
    return this.context.roles.reduce((maxRole, currentRole) => {
      return this.cachedRoleHierarchy.get(maxRole)?.has(currentRole)
        ? maxRole
        : currentRole;
    }, this.context.roles[0]);
  };
}
