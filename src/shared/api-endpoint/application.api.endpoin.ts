const ApplicationApiEndpoint = {
  LIST: '/applications',
  GET_BY_ID: '/applications/:id',
  CREATE: '/applications',
  UPDATE: '/applications/:id',
  DELETE: '/applications/:id',
  REGENERATE_SECRET: '/applications/:id/regenerate-secret',
};

export const {
  LIST: APPLICATION_LIST,
  GET_BY_ID: APPLICATION_GET_BY_ID,
  CREATE: APPLICATION_CREATE,
  UPDATE: APPLICATION_UPDATE,
  DELETE: APPLICATION_DELETE,
  REGENERATE_SECRET: APPLICATION_REGENERATE_SECRET,
} = ApplicationApiEndpoint;
