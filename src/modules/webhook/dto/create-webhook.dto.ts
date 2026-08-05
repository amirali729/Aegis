export class CreateWebhookDto {
  constructor(
    public readonly name: string,
    public readonly url: string,
    public readonly subscribedEvents: string[],
  ) {}
}
