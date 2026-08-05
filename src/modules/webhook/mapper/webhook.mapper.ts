import type { IWebhookDelivery } from '../model/webhook-delivery.model.js';
import type { IWebhook } from '../model/webhook.model.js';
import { WebhookDeliveryResponse } from '../responses/webhook-delivery.response.js';
import { WebhookResponse } from '../responses/webhook.response.js';

export function toWebhookDeliveryResponse(delivery: IWebhookDelivery): WebhookDeliveryResponse {
  return new WebhookDeliveryResponse(
    delivery._id.toString(),
    delivery.webhookId.toString(),
    delivery.eventId,
    delivery.eventType,
    delivery.status,
    delivery.attempts,
    delivery.maxAttempts,
    delivery.nextAttemptAt ?? null,
    delivery.lastAttemptAt ?? null,
    delivery.responseStatus ?? null,
    delivery.errorMessage ?? null,
    delivery.createdAt,
    delivery.updatedAt,
  );
}

export function toWebhookResponse(webhook: IWebhook): WebhookResponse {
  return new WebhookResponse(
    webhook._id.toString(),
    webhook.organizationId.toString(),
    webhook.name,
    webhook.url,
    webhook.status,
    webhook.subscribedEvents,
    webhook.lastSuccessAt ?? null,
    webhook.lastFailureAt ?? null,
    webhook.createdAt,
  );
}
