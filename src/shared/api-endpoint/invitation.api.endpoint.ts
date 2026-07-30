const InvitationApiEndpoint = {
  INVITE: '/organizations/:orgId/invitations',
  LIST: '/organizations/:orgId/invitations',
  REVOKE: '/organizations/:orgId/invitations/:invitationId',
  ACCEPT: '/invitations/accept',
};

export const {
  INVITE: INVITATION_INVITE,
  LIST: INVITATION_LIST,
  REVOKE: INVITATION_REVOKE,
  ACCEPT: INVITATION_ACCEPT,
} = InvitationApiEndpoint;
