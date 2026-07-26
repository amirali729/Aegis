const security = [{ cookieAuth: [] }, { bearerAuth: [] }];

export const sessionPaths = {
  '/api/v1/sessions': {
    get: {
      tags: ['Sessions'],
      summary: 'List your active sessions/devices',
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
                    items: { $ref: '#/components/schemas/Session' },
                  },
                },
              },
            },
          },
        },
        '401': { description: 'Not authenticated' },
      },
    },
  },

  '/api/v1/sessions/{id}': {
    delete: {
      tags: ['Sessions'],
      summary: 'Revoke a session (log out a specific device)',
      security,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Revoked' },
        '404': { description: 'Not found (or belongs to another user)' },
      },
    },
  },
};
