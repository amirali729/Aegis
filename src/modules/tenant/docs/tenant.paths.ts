const security = [{ cookieAuth: [] }, { bearerAuth: [] }];

export const tenantPaths = {
  '/api/v1/tenants': {
    get: {
      tags: ['Tenants'],
      summary: 'List all tenants',
      description: 'Platform-admin operation. Only relevant when MULTI_TENANT=true (Hosted SaaS).',
      security,
      responses: {
        '200': {
          description: 'OK',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Tenant' },
                  },
                },
              },
            },
          },
        },
        '403': { description: 'Missing tenant:view' },
      },
    },
    post: {
      tags: ['Tenants'],
      summary: 'Create a tenant',
      security,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateTenantRequest' },
          },
        },
      },
      responses: {
        '201': { description: 'Created' },
        '403': { description: 'Missing tenant:create' },
        '409': { description: 'Slug already in use' },
      },
    },
  },

  '/api/v1/tenants/{id}': {
    get: {
      tags: ['Tenants'],
      summary: 'Get a tenant by id',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'OK' },
        '404': { description: 'Not found' },
      },
    },
    patch: {
      tags: ['Tenants'],
      summary: 'Update a tenant',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateTenantRequest' },
          },
        },
      },
      responses: {
        '200': { description: 'Updated' },
        '404': { description: 'Not found' },
      },
    },
    delete: {
      tags: ['Tenants'],
      summary: 'Delete a tenant',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Deleted' },
        '404': { description: 'Not found' },
      },
    },
  },
};
