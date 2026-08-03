import type { IWebhook } from '../model/webhook.model.js';
import { WebhookResponse } from '../responses/webhook.response.js';

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
