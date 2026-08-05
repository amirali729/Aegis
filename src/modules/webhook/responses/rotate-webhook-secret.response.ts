export class RotateWebhookSecretResponse {
  constructor(
    public readonly webhookId: string,
    public readonly secret: string,
    public readonly warning: string = 'Store this signing secret now - it will not be shown again.',
  ) {}
}
