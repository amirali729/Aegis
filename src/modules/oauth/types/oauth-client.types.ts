import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { ApplicationNotFoundError } from '../../application/errors/application-not-found.error.js';
import type { OAuthClientNotFoundError } from '../errors/oauth-client-not-found.error.js';
import type { OAuthClientCreatedResponse } from '../responses/oauth-client-created.response.js';
import type { OAuthClientResponse } from '../responses/oauth-client.response.js';
import type { RegenerateClientSecretResponse } from '../responses/regenerate-client-secret.response.js';

export type OAuthClientError =
  OAuthClientNotFoundError | ApplicationNotFoundError | ValidationError | InfrastructureError;

export type OAuthClientResult = Result<OAuthClientResponse, OAuthClientError>;

export type OAuthClientListResult = Result<OAuthClientResponse[], OAuthClientError>;

export type OAuthClientCreatedResult = Result<OAuthClientCreatedResponse, OAuthClientError>;

export type RegenerateClientSecretResult = Result<RegenerateClientSecretResponse, OAuthClientError>;

export type RevokeOAuthClientResult = Result<{ message: string }, OAuthClientError>;
