import { RoleBasedPermissions, RoleHierarchy } from './config';

interface PermissionContext {
  roles: string[];
  permissions: string[];
}

export class PermissionManager {
  private readonly cachedRoleHierarchy: Map<string, Set<string>> = new Map();
  private readonly cachedRolePermissions: Map<string, Set<string>> = new Map();

  constructor(private readonly context: PermissionContext) {
    Object.keys(RoleHierarchy).forEach((role) => {
      this.cachedRoleHierarchy.set(role, this.computeRoleHierarchy(role));
    });

    Object.keys(RoleBasedPermissions).forEach((role) => {
      this.cachedRolePermissions.set(role, this.computePermissions(role));
    });
  }

  private computeRoleHierarchy(role: string, visited: Set<string> = new Set()) {
    const result = new Set<string>();

    if (visited.has(role)) {
      return result;
    }

    visited.add(role);

    const inheritedRoles = RoleHierarchy[role] || [];
    inheritedRoles.forEach((inheritedRole) => {
      result.add(inheritedRole);

      const inheritedHierarchy = this.computeRoleHierarchy(
        inheritedRole,
        visited,
      );
      inheritedHierarchy.forEach((r) => result.add(r));
    });

    return result;
  }

  // compute permissions
  private computePermissions(role: string, visited: Set<string> = new Set()) {
    const result = new Set<string>();

    if (visited.has(role)) {
      return result;
    }

    visited.add(role);

    RoleBasedPermissions[role]?.forEach((permission) => result.add(permission));
    const hierarchySet = this.cachedRoleHierarchy.get(role);

    hierarchySet?.forEach((inheritedRole) => {
      RoleBasedPermissions[inheritedRole]?.forEach((permission) =>
        result.add(permission),
      );
    });

    return result;
  }

  public hasPermission(permission: string): boolean {
    if (this.context.permissions.includes(permission)) {
      return true;
    }

    for (const role of this.context.roles) {
      const rolePermissions = this.cachedRolePermissions.get(role);
      if (rolePermissions && rolePermissions.has(permission)) {
        return true;
      }
    }

    return false;
  }
}
