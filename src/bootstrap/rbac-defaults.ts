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
  { key: 'oauth_client:view', description: 'View OAuth clients for an application.' },
  { key: 'oauth_client:create', description: 'Register a new OAuth client for an application.' },
  { key: 'oauth_client:update', description: 'Regenerate an OAuth client secret.' },
  { key: 'oauth_client:delete', description: 'Revoke an OAuth client.' },
  { key: 'webhook:view', description: 'View webhooks for an organization.' },
  { key: 'webhook:create', description: 'Register a new webhook for an organization.' },
  {
    key: 'webhook:update',
    description: 'Update, rotate the secret of, enable, or disable a webhook.',
  },
  { key: 'webhook:delete', description: 'Delete a webhook.' },
  {
    key: 'webhook:redeliver',
    description: 'Manually trigger redelivery of a failed or dead-lettered webhook event.',
  },
];

// NOTE: there used to be a DEFAULT_ROLES export here seeding two global
// (tenantId: undefined) Role documents, "Admin" and "User", which acted
// as a stand-in for platform-level access by being assigned directly to
// User.roles. That mechanism is gone - platform-level access is now a
// fixed User.platformRole enum ('owner'/'admin'/'support'/'user', see
// shared/security/authorization/platform-roles.ts) with a hardcoded
// permission-key map, not a customizable Role document. See
// bootstrap/assign-admin.ts for granting the 'owner' platform role.
//
// This file's permission catalog is still very much in use though: an
// org's auto-provisioned "Owner" role (see
// organizations/service/organization.service.impl.ts, provisionOwner)
// is granted every permission in DEFAULT_PERMISSIONS.
