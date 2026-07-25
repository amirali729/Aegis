const RoleApiEndpoint = {
  LIST: '/roles',
  GET_BY_ID: '/roles/:id',
  CREATE: '/roles',
  UPDATE: '/roles/:id',
  SET_PERMISSIONS: '/roles/:id/permissions',
  DELETE: '/roles/:id',
  ASSIGN_TO_USER: '/users/:userId/roles',
  REMOVE_FROM_USER: '/users/:userId/roles/:roleId',
};

export const {
  LIST: ROLE_LIST,
  GET_BY_ID: ROLE_GET_BY_ID,
  CREATE: ROLE_CREATE,
  UPDATE: ROLE_UPDATE,
  SET_PERMISSIONS: ROLE_SET_PERMISSIONS,
  DELETE: ROLE_DELETE,
  ASSIGN_TO_USER: ROLE_ASSIGN_TO_USER,
  REMOVE_FROM_USER: ROLE_REMOVE_FROM_USER,
} = RoleApiEndpoint;
