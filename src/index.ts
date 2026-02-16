//  simplified role hierarchy for demonstration purposes

import { PermissionManager } from './pm/permissionManager';

const simpleRoleHierarchy = {
  superAdmin: ['admin', 'manager', 'proof_reader', 'editor', 'user'],
  admin: ['manager', 'proof-reader', 'editor', 'user'],
  manager: ['proof-reader', 'editor', 'sales_manager', 'user'],
  sales_manager: ['user'],
  proof_reader: ['user'],
  editor: ['user'],
  premium_user: ['user'],
  user: [],
};

const user = {
  id: '123',
  name: 'John Doe',
  roles: ['super_admin'],
  permissions: [],
};

const pm = new PermissionManager({
  roles: user.roles,
  permissions: user.permissions,
});

// console.log(pm.hasPermission('product:delete'));
// console.log(pm.hasPermission('product:read'));
// console.log(pm.hasPermission('product:update'));
// console.log(pm.hasPermission('product:create'));
// console.log(pm.hasPermission('user:create'));
console.log(pm.hasPermissions(['product:delete', 'product:read']));
