export class CreateApiKeyDto {
  constructor(
    public readonly name: string,
    public readonly expiresInDays?: number,
  ) {}
}
