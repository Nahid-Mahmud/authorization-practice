interface PermissionContext {
  roles: string[];
  permissions: string[];
}

export class PermissionManager {
  private readonly cachedRoleHierarchy: Map<string, Set<string>> = new Map();
  private readonly cachedRolePermissions: Map<string, Set<string>> = new Map();

  constructor(private readonly context: PermissionContext) {}

  private computeRoleHierarchy(role: string, visited: Set<string> = new Set()) {
    const result = new Set<string>();
    if (visited.has(role)) {
      return result;
    }




    
  }
}
