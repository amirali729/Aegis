import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { ApplicationNotFoundError } from '../errors/application-not-found.error.js';
import type { InvalidClientCredentialsError } from '../errors/invalid-client-credentials.error.js';
import type { ApiKeyNotFoundError } from '../errors/api-key-not-found.error.js';
import type { InvalidApiKeyError } from '../errors/invalid-api-key.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { ApplicationResponse } from '../responses/application.response.js';
import type { ApplicationCreatedResponse } from '../responses/application-created.response.js';
import type { RegenerateSecretResponse } from '../responses/regenerate-secret.response.js';
import type { ApiKeyResponse } from '../responses/api-key.response.js';
import type { ApiKeyCreatedResponse } from '../responses/api-key-created.response.js';
import type { IApplication } from '../models/application.model.js';

export type ApplicationError =
  | ApplicationNotFoundError
  | InvalidClientCredentialsError
  | ApiKeyNotFoundError
  | InvalidApiKeyError
  | ValidationError
  | InfrastructureError;

export type ApplicationResult = Result<ApplicationResponse, ApplicationError>;

export type ApplicationCreatedResult = Result<ApplicationCreatedResponse, ApplicationError>;

export type ApplicationListResult = Result<ApplicationResponse[], ApplicationError>;

export type DeleteApplicationResult = Result<{ message: string }, ApplicationError>;

export type RegenerateSecretResult = Result<RegenerateSecretResponse, ApplicationError>;

export type ApiKeyResult = Result<ApiKeyResponse, ApplicationError>;

export type ApiKeyCreatedResult = Result<ApiKeyCreatedResponse, ApplicationError>;

export type ApiKeyListResult = Result<ApiKeyResponse[], ApplicationError>;

export type RevokeApiKeyResult = Result<{ message: string }, ApplicationError>;

export type VerifyApiKeyResult = Result<IApplication, ApplicationError>;
