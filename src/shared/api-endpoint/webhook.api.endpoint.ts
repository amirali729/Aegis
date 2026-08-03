const WebhookApiEndpoint = {
  LIST: '/organizations/:orgId/webhooks',
  CREATE: '/organizations/:orgId/webhooks',
  UPDATE: '/organizations/:orgId/webhooks/:webhookId',
  ROTATE_SECRET: '/organizations/:orgId/webhooks/:webhookId/rotate-secret',
  ENABLE: '/organizations/:orgId/webhooks/:webhookId/enable',
  DISABLE: '/organizations/:orgId/webhooks/:webhookId/disable',
  DELETE: '/organizations/:orgId/webhooks/:webhookId',
};

export const {
  LIST: WEBHOOK_LIST,
  CREATE: WEBHOOK_CREATE,
  UPDATE: WEBHOOK_UPDATE,
  ROTATE_SECRET: WEBHOOK_ROTATE_SECRET,
  ENABLE: WEBHOOK_ENABLE,
  DISABLE: WEBHOOK_DISABLE,
  DELETE: WEBHOOK_DELETE,
} = WebhookApiEndpoint;
