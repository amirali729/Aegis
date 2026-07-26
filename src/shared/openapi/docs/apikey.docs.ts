const security = [{ cookieAuth: [] }, { bearerAuth: [] }];

export const applicationPaths = {
  '/api/v1/applications': {
    get: {
      tags: ['Applications'],
      summary: 'List applications',
      description: 'When MULTI_TENANT=true, scoped to the tenant resolved from X-Tenant-ID.',
      security,
      parameters: [
        {
          name: 'X-Tenant-ID',
          in: 'header',
          required: false,
          schema: { type: 'string' },
          description: 'Only used when MULTI_TENANT=true.',
        },
      ],
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
                    items: { $ref: '#/components/schemas/Application' },
                  },
                },
              },
            },
          },
        },
        '403': { description: 'Missing application:view' },
      },
    },
    post: {
      tags: ['Applications'],
      summary: 'Register a new application',
      description: 'Returns the plaintext `clientSecret` exactly once - store it immediately.',
      security,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateApplicationRequest',
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
                  data: {
                    $ref: '#/components/schemas/ApplicationCreated',
                  },
                },
              },
            },
          },
        },
        '403': { description: 'Missing application:create' },
      },
    },
  },

  '/api/v1/applications/{id}': {
    get: {
      tags: ['Applications'],
      summary: 'Get an application by id',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'OK' },
        '404': { description: 'Not found' },
      },
    },
    patch: {
      tags: ['Applications'],
      summary: 'Update an application',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateApplicationRequest',
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
      tags: ['Applications'],
      summary: 'Delete an application',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Deleted' },
        '404': { description: 'Not found' },
      },
    },
  },

  '/api/v1/applications/{id}/regenerate-secret': {
    post: {
      tags: ['Applications'],
      summary: 'Regenerate a client secret',
      description:
        'Invalidates the old secret immediately. Returns the new plaintext secret exactly once.',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': {
          description: 'Regenerated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    $ref: '#/components/schemas/RegenerateSecretResult',
                  },
                },
              },
            },
          },
        },
        '404': { description: 'Not found' },
      },
    },
  },

  '/api/v1/applications/{appId}/api-keys': {
    get: {
      tags: ['API Keys'],
      summary: 'List API keys for an application',
      description: 'Metadata only - raw keys are never retrievable after creation.',
      security,
      parameters: [
        {
          name: 'appId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
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
                    items: { $ref: '#/components/schemas/ApiKey' },
                  },
                },
              },
            },
          },
        },
        '404': { description: 'Application not found' },
      },
    },
    post: {
      tags: ['API Keys'],
      summary: 'Create an API key',
      description:
        'Returns the plaintext key exactly once - store it immediately. Use it later via the `X-API-Key` header.',
      security,
      parameters: [
        {
          name: 'appId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateApiKeyRequest' },
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
                  data: { $ref: '#/components/schemas/ApiKeyCreated' },
                },
              },
            },
          },
        },
        '404': { description: 'Application not found' },
      },
    },
  },

  '/api/v1/applications/{appId}/api-keys/{keyId}': {
    delete: {
      tags: ['API Keys'],
      summary: 'Revoke an API key',
      security,
      parameters: [
        {
          name: 'appId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
        {
          name: 'keyId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Revoked' },
        '404': { description: 'API key not found' },
      },
    },
  },
};
