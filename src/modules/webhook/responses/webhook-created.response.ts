import { WebhookResponse } from './webhook.response.js';

export class WebhookCreatedResponse extends WebhookResponse {
  constructor(
    webhook: WebhookResponse,
    public readonly secret: string,
    public readonly warning: string = 'Store this signing secret now - it will not be shown again.',
  ) {
    super(
      webhook.id,
      webhook.organizationId,
      webhook.name,
      webhook.url,
      webhook.status,
      webhook.subscribedEvents,
      webhook.lastSuccessAt,
      webhook.lastFailureAt,
      webhook.createdAt,
    );
  }
}
