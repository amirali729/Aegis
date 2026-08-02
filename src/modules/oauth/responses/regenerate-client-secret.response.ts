export class RegenerateClientSecretResponse {
  constructor(
    public readonly clientId: string,
    public readonly clientSecret: string,
    public readonly warning: string = 'Store this client secret now - it will not be shown again.',
  ) {}
}
