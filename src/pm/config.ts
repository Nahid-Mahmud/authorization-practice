export const RoleHierarchy: Record<string, string[]> = {
  super_admin: ['admin'],
  admin: ['manager'],
  manager: ['proof-reader', 'editor', 'sales_manager'],
  sales_manager: ['user'],
  proof_reader: ['user'],
  editor: ['user'],

  //user roles
  premium_user: ['user'],
  user: [],
} as const;

export const RoleBasedPermissions: Record<string, string[]> = {
  super_admin: [],
  admin: ['product:delete', 'user:delete', 'user:create'],
  manager: ['product:create', 'product:update'],
  proof_reader: ['product:update'],
  editor: ['product:create', 'product:update'],
  premium_user: ['product:review'],
  user: ['product:read'],
} as const;
