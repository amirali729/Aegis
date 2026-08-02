import type { IOAuthClient } from '../model/oauth-client.model.js';
import { OAuthClientResponse } from '../responses/oauth-client.response.js';

export function toOAuthClientResponse(client: IOAuthClient): OAuthClientResponse {
  return new OAuthClientResponse(
    client._id.toString(),
    client.applicationId.toString(),
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
