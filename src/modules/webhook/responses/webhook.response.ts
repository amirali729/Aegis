export class WebhookResponse {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly name: string,
    public readonly url: string,
    public readonly status: 'active' | 'disabled',
    public readonly subscribedEvents: string[],
    public readonly lastSuccessAt: Date | null,
    public readonly lastFailureAt: Date | null,
    public readonly createdAt: Date,
  ) {}
}
