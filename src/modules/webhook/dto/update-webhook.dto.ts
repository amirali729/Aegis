export class UpdateWebhookDto {
  constructor(
    public readonly name?: string,
    public readonly url?: string,
    public readonly subscribedEvents?: string[],
  ) {}
}
