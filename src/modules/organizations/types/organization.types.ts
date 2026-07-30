import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { OrganizationNotFoundError } from '../errors/organization-not-found.error.js';
import type { OrganizationSlugTakenError } from '../errors/organization-slug-taken.error.js';
import type { OrganizationResponse } from '../responses/organization-response.js';

export type OrganizationError =
  OrganizationNotFoundError | OrganizationSlugTakenError | ValidationError | InfrastructureError;

export type OrganizationResult = Result<OrganizationResponse, OrganizationError>;

export type OrganizationListResult = Result<OrganizationResponse[], OrganizationError>;

export type DeleteOrganizationResult = Result<{ message: string }, OrganizationError>;
