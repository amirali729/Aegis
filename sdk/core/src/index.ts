export { configureIdentity, IdentityClient } from './client.js';
export { IdentityApiError, IdentityNetworkError } from './errors.js';
export type { IdentityConfig } from './http-client.js';

export type {
  ApiKey,
  ApiKeyCreated,
  Application,
  ApplicationCreated,
  AuditLog,
  AuditLogList,
  ErrorEnvelope,
  LoginResult,
  Permission,
  RegenerateSecretResult,
  Role,
  Session,
  SuccessEnvelope,
  Tenant,
  User,
} from './types.js';

export type { CreateApiKeyInput } from './modules/api-keys.js';
export type { CreateApplicationInput, UpdateApplicationInput } from './modules/applications.js';
export type { ListAuditLogsInput } from './modules/audits.js';
export type {
  ChangePasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignUpInput,
} from './modules/auth.js';
export type { CreatePermissionInput } from './modules/permissions.js';
export type { CreateRoleInput, UpdateRoleInput } from './modules/roles.js';
export type { CreateTenantInput, UpdateTenantInput } from './modules/tenants.js';
