export class WebhookDeliveryResponse {
  constructor(
    public readonly id: string,
    public readonly webhookId: string,
    public readonly eventId: string,
    public readonly eventType: string,
    public readonly status: 'pending' | 'delivering' | 'delivered' | 'failed' | 'dead_letter',
    public readonly attempts: number,
    public readonly maxAttempts: number,
    public readonly nextAttemptAt: Date | null,
    public readonly lastAttemptAt: Date | null,
    public readonly responseStatus: number | null,
    // Deliberately excludes responseBody: it's stored server-side for
    // operator debugging (see webhook-delivery.model.ts) but can contain
    // an arbitrary customer endpoint's raw response text, which has no
    // business being echoed back through this API without a dedicated,
    // explicitly-audited "view raw response" affordance. Keep the list
    // endpoint lean.
    public readonly errorMessage: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
