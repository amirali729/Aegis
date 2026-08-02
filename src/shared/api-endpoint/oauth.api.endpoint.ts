const OAuthApiEndpoint = {
  AUTHORIZE: '/oauth/authorize',
  CONSENT_DECISION: '/oauth/consent/decision',
  TOKEN: '/oauth/token',
  REVOKE: '/oauth/revoke',
  INTROSPECT: '/oauth/introspect',
  USERINFO: '/oauth/userinfo',
  DISCOVERY: '/.well-known/openid-configuration',
  JWKS: '/.well-known/jwks.json',
};

export const {
  AUTHORIZE: OAUTH_AUTHORIZE,
  CONSENT_DECISION: OAUTH_CONSENT_DECISION,
  TOKEN: OAUTH_TOKEN,
  REVOKE: OAUTH_REVOKE,
  INTROSPECT: OAUTH_INTROSPECT,
  USERINFO: OAUTH_USERINFO,
  DISCOVERY: OAUTH_DISCOVERY,
  JWKS: OAUTH_JWKS,
} = OAuthApiEndpoint;
