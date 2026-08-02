const OAuthClientApiEndpoint = {
  LIST: '/applications/:appId/oauth-clients',
  CREATE: '/applications/:appId/oauth-clients',
  REGENERATE_SECRET: '/applications/:appId/oauth-clients/:clientId/regenerate-secret',
  REVOKE: '/applications/:appId/oauth-clients/:clientId',
};

export const {
  LIST: OAUTH_CLIENT_LIST,
  CREATE: OAUTH_CLIENT_CREATE,
  REGENERATE_SECRET: OAUTH_CLIENT_REGENERATE_SECRET,
  REVOKE: OAUTH_CLIENT_REVOKE,
} = OAuthClientApiEndpoint;
