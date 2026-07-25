import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { PermissionNotFoundError } from '../errors/permission-not-found.error.js';
import type { PermissionAlreadyExistsError } from '../errors/permission-already-exists.error.js';
import type { InvalidPermissionKeyError } from '../errors/invalid-permission-key.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { PermissionResponse } from '../responses/permission.response.js';

export type PermissionError =
  | PermissionNotFoundError
  | PermissionAlreadyExistsError
  | InvalidPermissionKeyError
  | ValidationError
  | InfrastructureError;

export type PermissionResult = Result<PermissionResponse, PermissionError>;

export type PermissionListResult = Result<PermissionResponse[], PermissionError>;

export type DeletePermissionResult = Result<{ message: string }, PermissionError>;
