// const TenantApiEndpoint = {
//   LIST: '/tenants',
//   GET_BY_ID: '/tenants/:id',
//   CREATE: '/tenants',
//   UPDATE: '/tenants/:id',
//   DELETE: '/tenants/:id',
// };

// export const {
//   LIST: TENANT_LIST,
//   GET_BY_ID: TENANT_GET_BY_ID,
//   CREATE: TENANT_CREATE,
//   UPDATE: TENANT_UPDATE,
//   DELETE: TENANT_DELETE,
// } = TenantApiEndpoint;
const OrganizationApiEndpoint = {
  LIST: '/organizations',
  // Must be registered before GET_BY_ID (/organizations/:id) in the
  // router - otherwise Express would match "me" as the :id param and
  // this route would never be reached.
  ME: '/organizations/me',
  GET_BY_ID: '/organizations/:id',
  CREATE: '/organizations',
  UPDATE: '/organizations/:id',
  DELETE: '/organizations/:id',
};

export const {
  LIST: ORGANIZATION_LIST,
  ME: ORGANIZATION_ME,
  GET_BY_ID: ORGANIZATION_GET_BY_ID,
  CREATE: ORGANIZATION_CREATE,
  UPDATE: ORGANIZATION_UPDATE,
  DELETE: ORGANIZATION_DELETE,
} = OrganizationApiEndpoint;
