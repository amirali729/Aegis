const security = [{ cookieAuth: [] }, { bearerAuth: [] }];

export const permissionPaths = {
  '/api/v1/permissions': {
    get: {
      tags: ['Permissions'],
      summary: 'List all permissions',
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
                    items: { $ref: '#/components/schemas/Permission' },
                  },
                },
              },
            },
          },
        },
        '403': { description: 'Missing permission:view' },
      },
    },
    post: {
      tags: ['Permissions'],
      summary: 'Create a permission',
      security,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreatePermissionRequest',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { $ref: '#/components/schemas/Permission' },
                },
              },
            },
          },
        },
        '400': { description: 'Invalid key format' },
        '403': { description: 'Missing permission:create' },
        '409': { description: 'Key already exists' },
      },
    },
  },

  '/api/v1/permissions/{id}': {
    get: {
      tags: ['Permissions'],
      summary: 'Get a permission by id',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'OK' },
        '404': { description: 'Not found' },
      },
    },
    patch: {
      tags: ['Permissions'],
      summary: "Update a permission's description",
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdatePermissionRequest',
            },
          },
        },
      },
      responses: {
        '200': { description: 'Updated' },
        '404': { description: 'Not found' },
      },
    },
    delete: {
      tags: ['Permissions'],
      summary: 'Delete a permission',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Deleted' },
        '404': { description: 'Not found' },
      },
    },
  },
};
