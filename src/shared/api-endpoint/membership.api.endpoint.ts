const MembershipApiEndpoint = {
  LIST: '/organizations/:orgId/members',
  SUSPEND: '/organizations/:orgId/members/:userId/suspend',
  REACTIVATE: '/organizations/:orgId/members/:userId/reactivate',
  REMOVE: '/organizations/:orgId/members/:userId',
};

export const {
  LIST: MEMBER_LIST,
  SUSPEND: MEMBER_SUSPEND,
  REACTIVATE: MEMBER_REACTIVATE,
  REMOVE: MEMBER_REMOVE,
} = MembershipApiEndpoint;
