import { ApplicationResponse } from './application.response.js';

export class ApplicationCreatedResponse extends ApplicationResponse {
  constructor(
    application: ApplicationResponse,
    public readonly clientSecret: string,
    public readonly warning: string = 'Store this client secret now - it will not be shown again.',
  ) {
    super(
      application.id,
      application.tenantId,
      application.name,
      application.clientId,
      application.allowedOrigins,
      application.redirectUris,
      application.accessTokenTTL,
      application.refreshTokenTTL,
      application.isActive,
      application.createdAt,
    );
  }
}
