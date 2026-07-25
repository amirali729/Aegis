import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { RoleNotFoundError } from '../errors/role-not-found.error.js';
import type { RoleAlreadyExistsError } from '../errors/role-already-exists.error.js';
import type { SystemRoleImmutableError } from '../errors/system-role-immutable.error.js';
import type { PermissionNotFoundError } from '../../permission/errors/permission-not-found.error.js';
import type { UserNotFoundError } from '../../auth/errors/user-not-found.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { RoleResponse } from '../responses/role.response.js';
import type { AssignRoleResponse } from '../responses/assign-role.response.js';

export type RoleError =
  | RoleNotFoundError
  | RoleAlreadyExistsError
  | SystemRoleImmutableError
  | PermissionNotFoundError
  | UserNotFoundError
  | ValidationError
  | InfrastructureError;

export type RoleResult = Result<RoleResponse, RoleError>;

export type RoleListResult = Result<RoleResponse[], RoleError>;

export type DeleteRoleResult = Result<{ message: string }, RoleError>;

export type AssignRoleResult = Result<AssignRoleResponse, RoleError>;
