const security = [{ cookieAuth: [] }, { bearerAuth: [] }];

export const rolePaths = {
  '/api/v1/roles': {
    get: {
      tags: ['Roles'],
      summary: 'List all roles',
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
                    items: { $ref: '#/components/schemas/Role' },
                  },
                },
              },
            },
          },
        },
        '403': { description: 'Missing role:view' },
      },
    },
    post: {
      tags: ['Roles'],
      summary: 'Create a role',
      security,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateRoleRequest' },
          },
        },
      },
      responses: {
        '201': { description: 'Created' },
        '403': { description: 'Missing role:create' },
        '409': { description: 'Role name already exists' },
      },
    },
  },

  '/api/v1/roles/{id}': {
    get: {
      tags: ['Roles'],
      summary: 'Get a role by id',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'OK' },
        '404': { description: 'Not found' },
      },
    },
    patch: {
      tags: ['Roles'],
      summary: "Update a role's name/description",
      description: 'System roles (isSystem: true) cannot be renamed.',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateRoleRequest' },
          },
        },
      },
      responses: {
        '200': { description: 'Updated' },
        '403': { description: 'System role is immutable' },
        '404': { description: 'Not found' },
      },
    },
    delete: {
      tags: ['Roles'],
      summary: 'Delete a role',
      description: 'System roles (isSystem: true) cannot be deleted.',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Deleted' },
        '403': { description: 'System role is immutable' },
        '404': { description: 'Not found' },
      },
    },
  },

  '/api/v1/roles/{id}/permissions': {
    put: {
      tags: ['Roles'],
      summary: "Replace a role's permission set",
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SetRolePermissionsRequest',
            },
          },
        },
      },
      responses: {
        '200': { description: 'Updated' },
        '400': { description: 'One or more permission ids do not exist' },
        '404': { description: 'Not found' },
      },
    },
  },

  '/api/v1/users/{userId}/roles': {
    post: {
      tags: ['Roles'],
      summary: 'Assign a role to a user',
      security,
      parameters: [
        {
          name: 'userId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignRoleRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Role assigned',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { $ref: '#/components/schemas/AssignRoleResult' },
                },
              },
            },
          },
        },
        '404': { description: 'User or role not found' },
      },
    },
  },

  '/api/v1/users/{userId}/roles/{roleId}': {
    delete: {
      tags: ['Roles'],
      summary: 'Remove a role from a user',
      security,
      parameters: [
        {
          name: 'userId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
        {
          name: 'roleId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Role removed' },
        '404': { description: 'User not found' },
      },
    },
  },
};
