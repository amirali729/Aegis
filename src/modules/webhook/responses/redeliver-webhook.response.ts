export class RedeliverWebhookResponse {
  constructor(
    public readonly deliveryId: string,
    public readonly status: 'pending',
    public readonly message: string = 'Redelivery has been scheduled.',
  ) {}
}
