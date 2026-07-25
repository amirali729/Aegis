const TenantApiEndpoint = {
  LIST: '/tenants',
  GET_BY_ID: '/tenants/:id',
  CREATE: '/tenants',
  UPDATE: '/tenants/:id',
  DELETE: '/tenants/:id',
};

export const {
  LIST: TENANT_LIST,
  GET_BY_ID: TENANT_GET_BY_ID,
  CREATE: TENANT_CREATE,
  UPDATE: TENANT_UPDATE,
  DELETE: TENANT_DELETE,
} = TenantApiEndpoint;
