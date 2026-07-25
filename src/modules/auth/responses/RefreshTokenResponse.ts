export class RefreshTokenResponse {
  readonly kind = 'success';

  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly message = 'Access token refreshed successfully.',
  ) {}
}
