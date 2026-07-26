import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { ApplicationNotFoundError } from '../../application/errors/application-not-found.error.js';
import type { IApplication } from '../../application/model/application.model.js';
import type { ApiKeyNotFoundError } from '../errors/api-key-not-found.error.js';
import type { InvalidApiKeyError } from '../errors/invalid-api-key.error.js';
import type { ApiKeyCreatedResponse } from '../responses/api-key-created.response.js';
import type { ApiKeyResponse } from '../responses/api-key.response.js';

export type ApikeyError =
  | ApiKeyNotFoundError
  | InvalidApiKeyError
  | ApplicationNotFoundError
  | ValidationError
  | InfrastructureError;

export type ApiKeyResult = Result<ApiKeyResponse, ApikeyError>;

export type ApiKeyCreatedResult = Result<ApiKeyCreatedResponse, ApikeyError>;

export type ApiKeyListResult = Result<ApiKeyResponse[], ApikeyError>;

export type RevokeApiKeyResult = Result<{ message: string }, ApikeyError>;

export type VerifyApiKeyResult = Result<IApplication, ApikeyError>;
