// const ApplicationApiEndpoint = {
//   LIST: '/applications',
//   GET_BY_ID: '/applications/:id',
//   CREATE: '/applications',
//   UPDATE: '/applications/:id',
//   DELETE: '/applications/:id',
//   REGENERATE_SECRET: '/applications/:id/regenerate-secret',

//   API_KEY_LIST: '/applications/:appId/api-keys',
//   API_KEY_CREATE: '/applications/:appId/api-keys',
//   API_KEY_REVOKE: '/applications/:appId/api-keys/:keyId',
// };
const ApiEndpoint = {
  API_KEY_LIST: '/applications/:appId/api-keys',
  API_KEY_CREATE: '/applications/:appId/api-keys',
  API_KEY_REVOKE: '/applications/:appId/api-keys/:keyId',
};

export const { API_KEY_LIST, API_KEY_CREATE, API_KEY_REVOKE } = ApiEndpoint;
