import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { AuditLogListResponse } from '../responses/audit-log-list.response.js';

export type AuditError = InfrastructureError;

export type AuditLogListResult = Result<AuditLogListResponse, AuditError>;
