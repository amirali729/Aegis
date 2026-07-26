const security = [{ cookieAuth: [] }, { bearerAuth: [] }];

export const auditPaths = {
  '/api/v1/audit-logs': {
    get: {
      tags: ['Audit'],
      summary: 'List audit log entries',
      description:
        'Append-only security event log (logins, failed logins, password changes/resets, logout-all, etc.). Filterable and paginated.',
      security,
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 200 } },
        { name: 'actorId', in: 'query', schema: { type: 'string' } },
        { name: 'action', in: 'query', schema: { type: 'string' }, example: 'auth.login' },
        { name: 'targetType', in: 'query', schema: { type: 'string' } },
        { name: 'targetId', in: 'query', schema: { type: 'string' } },
        { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
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
                    type: 'object',
                    properties: {
                      logs: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/AuditLog' },
                      },
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        '403': { description: 'Missing audit:view' },
      },
    },
  },
};
