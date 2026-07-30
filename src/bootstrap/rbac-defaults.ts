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
  { key: 'organization:view', description: 'View organizations.' },
  { key: 'organization:create', description: 'Create organizations.' },
  { key: 'organization:update', description: 'Update organizations.' },
  { key: 'organization:delete', description: 'Delete organizations.' },
  { key: 'application:view', description: 'View applications.' },
  { key: 'application:create', description: 'Create applications.' },
  { key: 'application:update', description: 'Update applications and regenerate client secrets.' },
  { key: 'application:delete', description: 'Delete applications.' },
  { key: 'apikey:view', description: 'View API keys (metadata only).' },
  { key: 'apikey:create', description: 'Create API keys.' },
  { key: 'apikey:delete', description: 'Revoke API keys.' },
  { key: 'member:view', description: 'View organization members.' },
  { key: 'member:remove', description: 'Remove or suspend organization members.' },
  { key: 'invitation:create', description: 'Invite new members to an organization.' },
  { key: 'invitation:view', description: 'View pending organization invitations.' },
  { key: 'invitation:revoke', description: 'Revoke organization invitations.' },
  { key: 'audit:view', description: 'View audit logs.' },
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
