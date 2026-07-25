const ApplicationApiEndpoint = {
  LIST: '/applications',
  GET_BY_ID: '/applications/:id',
  CREATE: '/applications',
  UPDATE: '/applications/:id',
  DELETE: '/applications/:id',
  REGENERATE_SECRET: '/applications/:id/regenerate-secret',

  API_KEY_LIST: '/applications/:appId/api-keys',
  API_KEY_CREATE: '/applications/:appId/api-keys',
  API_KEY_REVOKE: '/applications/:appId/api-keys/:keyId',
};

export const {
  LIST: APPLICATION_LIST,
  GET_BY_ID: APPLICATION_GET_BY_ID,
  CREATE: APPLICATION_CREATE,
  UPDATE: APPLICATION_UPDATE,
  DELETE: APPLICATION_DELETE,
  REGENERATE_SECRET: APPLICATION_REGENERATE_SECRET,
  API_KEY_LIST,
  API_KEY_CREATE,
  API_KEY_REVOKE,
} = ApplicationApiEndpoint;
