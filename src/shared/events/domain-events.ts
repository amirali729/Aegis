/**
 * The full, agreed vocabulary of domain events published across the
 * backend. Every string here is deliberately IDENTICAL to the
 * corresponding `RecordAuditEventDto` event-type string already in use
 * (see each module's service implementation) wherever the same real-world action
 * already has an audit event - not a coincidence: it means publishing a
 * domain event and recording an audit event for the same action always
 * agree on what to call it, and it's what makes "Audit becomes just
 * another Event Bus subscriber" a realistic future step (see
 * event-bus.ts) rather than a second, parallel naming scheme to keep in
 * sync by hand.
 *
 * A few of these deliberately DIFFER from the exact names suggested in
 * the target architecture brief, because this codebase's actual,
 * already-shipped vocabulary uses a different (but equivalent) name for
 * the same action:
 *
 *   Brief suggested      | Actually used here   | Why
 *   ---------------------|------------------------|----------------------------------------
 *   member.invited        | invitation.created     | Membership itself isn't touched until
 *                          |                        | acceptance - creating an Invitation is
 *                          |                        | the real event; see invitation module.
 *   member.joined         | invitation.accepted     | Accepting an Invitation is what actually
 *                          |                        | creates the Membership - "joined" and
 *                          |                        | "accepted" are the same real action.
 *   oauth.client.created   | oauth_client.created   | Matches this module's existing audit
 *   oauth.client.deleted   | oauth_client.revoked    | events exactly (see oauth-client.service
 *                          |                        | .impl.ts) - OAuth clients are revoked
 *                          |                        | (a status flip), never hard-deleted.
 *   api_key.created        | apikey.created         | Matches the ApiKey module's existing
 *   api_key.deleted        | apikey.revoked          | audit events - API keys are revoked, not
 *                          |                        | deleted, same reasoning as OAuth clients.
 *   user.login              | auth.login             | Matches AuthService's existing audit
 *   user.logout             | auth.logout_all         | event names exactly.
 *
 * Everything else below matches the brief's suggested name verbatim.
 */
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
