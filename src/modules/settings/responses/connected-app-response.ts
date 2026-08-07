export class ConnectedAppResponse {
  constructor(
    public readonly id: string,
    public readonly provider: string,
    public readonly providerAccountId: string,
    public readonly scopes: string[],
    public readonly connectedAt: Date,
  ) {}
}
