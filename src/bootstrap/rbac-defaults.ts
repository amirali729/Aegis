export const DEFAULT_PERMISSIONS: Array<{
  key: string;
  description: string;
}> = [
  { key: 'user:view', description: 'View user accounts.' },
  { key: 'user:update', description: 'Update user accounts.' },
  { key: 'user:delete', description: 'Delete user accounts.' },
  { key: 'role:view', description: 'View roles.' },
  { key: 'role:create', description: 'Create roles.' },
  { key: 'role:update', description: 'Update roles and their permission assignments.' },
  { key: 'role:delete', description: 'Delete roles.' },
  { key: 'permission:view', description: 'View permissions.' },
  { key: 'permission:create', description: 'Create permissions.' },
  { key: 'permission:update', description: 'Update permissions.' },
  { key: 'permission:delete', description: 'Delete permissions.' },
];

export const DEFAULT_ROLES: Array<{
  name: string;
  description: string;
  isSystem: boolean;
  /** "*" grants every permission in DEFAULT_PERMISSIONS. */
  permissionKeys: string[] | '*';
}> = [
  {
    name: 'Admin',
    description: 'Full administrative access.',
    isSystem: true,
    permissionKeys: '*',
  },
  {
    name: 'User',
    description: 'Default role for newly registered accounts. No elevated permissions.',
    isSystem: true,
    permissionKeys: [],
  },
];
