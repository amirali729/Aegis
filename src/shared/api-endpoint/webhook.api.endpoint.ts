const WebhookApiEndpoint = {
  LIST: '/organizations/:orgId/webhooks',
  CREATE: '/organizations/:orgId/webhooks',
  UPDATE: '/organizations/:orgId/webhooks/:webhookId',
  ROTATE_SECRET: '/organizations/:orgId/webhooks/:webhookId/rotate-secret',
  ENABLE: '/organizations/:orgId/webhooks/:webhookId/enable',
  DISABLE: '/organizations/:orgId/webhooks/:webhookId/disable',
  DELETE: '/organizations/:orgId/webhooks/:webhookId',
  DELIVERY_LIST: '/organizations/:orgId/webhooks/:webhookId/deliveries',
  DELIVERY_REDELIVER: '/organizations/:orgId/webhooks/:webhookId/deliveries/:deliveryId/redeliver',
};

export const {
  LIST: WEBHOOK_LIST,
  CREATE: WEBHOOK_CREATE,
  UPDATE: WEBHOOK_UPDATE,
  ROTATE_SECRET: WEBHOOK_ROTATE_SECRET,
  ENABLE: WEBHOOK_ENABLE,
  DISABLE: WEBHOOK_DISABLE,
  DELETE: WEBHOOK_DELETE,
  DELIVERY_LIST: WEBHOOK_DELIVERY_LIST,
  DELIVERY_REDELIVER: WEBHOOK_DELIVERY_REDELIVER,
} = WebhookApiEndpoint;
