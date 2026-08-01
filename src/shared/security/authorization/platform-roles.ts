/**
 * Platform-level roles (see Aegis Backend Architecture, section 6:
 * "Platform Layer"). Unlike organization roles, this is a small, fixed
 * set defined by the architecture itself - not a customizable Role
 * document. A user holds exactly one of these at a time, stored
 * directly on User.platformRole.
 *
 * This replaces the previous mechanism, where a "platform-level" user
 * was really just someone holding a Role document with tenantId
 * undefined (a "global role") directly on User.roles. That approach
 * worked but conflated two different concepts under one Role model:
 * fixed platform capabilities vs. customizable per-organization roles.
 * Splitting them lets organization Roles stay fully custom while the
 * platform layer stays simple and predictable.
 */
export const PLATFORM_ROLES = ['owner', 'admin', 'support', 'user'] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

/**
 * Sentinel meaning "every permission key, including ones added in the
 * future" - used for Platform Owner instead of enumerating the current
 * DEFAULT_PERMISSIONS catalog, so a newly added permission is
 * automatically covered without needing to touch this map. Consumers
 * (see requirePermission.middleware.ts) must check for this sentinel
 * explicitly.
 */
export const ALL_PERMISSIONS = '*';

/**
 * Fixed permission-key grants per platform role. These map onto the
 * SAME permission keys used everywhere else (see
 * bootstrap/rbac-defaults.ts) so requirePermission()/
 * requireAnyPermission() do not need a separate code path for
 * platform-level vs organization-level checks - they just check
 * against the union of both (see permission-evaluator.ts).
 *
 * Capabilities are drawn from the architecture doc's descriptions of
 * each platform role (section 6). Where the doc names a capability with
 * no existing permission key (e.g. Platform Support's "Reset accounts"),
 * it is deliberately left out here rather than guessed at - add the
 * permission key explicitly (in rbac-defaults.ts) and then grant it here
 * when that capability is actually built.
 */
export const PLATFORM_ROLE_PERMISSIONS: Record<PlatformRole, string[] | typeof ALL_PERMISSIONS> = {
  // "Usually seeded during installation. Never created through signup."
  // See bootstrap/assign-admin.ts.
  owner: ALL_PERMISSIONS,

  // "View organizations, Manage users, View logs, Moderate platform."
  // "Cannot own the platform."
  admin: ['user:view', 'user:update', 'organization:view', 'organization:update', 'audit:view'],

  // "View users, View organizations, Reset accounts."
  // "Cannot modify platform configuration."
  support: ['user:view', 'organization:view'],

  // Default role after signup. Login/logout/profile/session management
  // etc. are authenticated-user actions, not permission-gated, so the
  // only permission keys a bare Platform User needs are the ones that
  // let them get started: creating and viewing their own organizations.
  user: ['organization:create', 'organization:view'],
};
