export const DOMAIN_EVENTS = {
  ORGANIZATION_CREATED: 'organization.created',
  ORGANIZATION_UPDATED: 'organization.updated',
  ORGANIZATION_DELETED: 'organization.deleted',

  MEMBER_INVITED: 'invitation.created',
  MEMBER_JOINED: 'invitation.accepted',
  INVITATION_REVOKED: 'invitation.revoked',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_SUSPENDED: 'member.suspended',
  MEMBER_REACTIVATED: 'member.reactivated',

  ROLE_CREATED: 'role.created',
  ROLE_UPDATED: 'role.updated',
  ROLE_DELETED: 'role.deleted',
  ROLE_ASSIGNED: 'role.assigned',
  ROLE_REMOVED: 'role.removed',

  APPLICATION_CREATED: 'application.created',
  APPLICATION_UPDATED: 'application.updated',
  APPLICATION_DELETED: 'application.deleted',

  OAUTH_CLIENT_CREATED: 'oauth_client.created',
  OAUTH_CLIENT_REVOKED: 'oauth_client.revoked',
  OAUTH_TOKEN_REVOKED: 'oauth_token.revoked',

  API_KEY_CREATED: 'apikey.created',
  API_KEY_REVOKED: 'apikey.revoked',

  USER_LOGIN: 'auth.login',
  USER_LOGOUT: 'auth.logout_all',
} as const;

export type DomainEventType = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS];
