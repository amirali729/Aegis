import { OAuthClientResponse } from './oauth-client.response.js';

export class OAuthClientCreatedResponse extends OAuthClientResponse {
  constructor(
    client: OAuthClientResponse,
    /** Only present for confidential clients - undefined for public clients, which never get a secret. */
    public readonly clientSecret: string | undefined,
    public readonly warning: string = 'Store this client secret now - it will not be shown again.',
  ) {
    super(
      client.id,
      client.applicationId,
      client.name,
      client.clientId,
      client.clientType,
      client.redirectUris,
      client.grantTypes,
      client.scopes,
      client.status,
      client.createdAt,
    );
  }
}
