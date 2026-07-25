import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import type { TenantSlugTakenError } from '../errors/tenant-slug-taken.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { TenantResponse } from '../responses/tenant-response.js';

export type TenantError =
  TenantNotFoundError | TenantSlugTakenError | ValidationError | InfrastructureError;

export type TenantResult = Result<TenantResponse, TenantError>;

export type TenantListResult = Result<TenantResponse[], TenantError>;

export type DeleteTenantResult = Result<{ message: string }, TenantError>;
