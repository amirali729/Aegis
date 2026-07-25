export const healthPaths = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Liveness / readiness check',
      security: [],
      responses: {
        '200': { description: 'Service is healthy and DB is connected' },
        '503': { description: 'Service is degraded (DB disconnected)' },
      },
    },
  },
};
