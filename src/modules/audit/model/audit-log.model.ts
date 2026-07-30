import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export type AuditActorType = 'user' | 'system' | 'api_key';

export interface IAuditLog extends Document {
  /** Null in single-tenant self-hosted deployments (MULTI_TENANT=false). */
  tenantId?: Types.ObjectId;
  /** Who performed the action. Null for actorType "system". */
  actorId?: Types.ObjectId;
  actorType: AuditActorType;
  /** Dot-namespaced event name, e.g. "auth.login", "role.assigned". */
  action: string;
  success: boolean;
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  readonly createdAt: Date;
}

const auditLogSchema: Schema = new mongoose.Schema(
  {
    // Field kept as "tenantId" (pre-dates the Organization rename) but
    // points at the Organization collection - Organization IS the tenant.
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    actorType: {
      type: String,
      enum: ['user', 'system', 'api_key'],
      default: 'user',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    success: {
      type: Boolean,
      required: true,
      default: true,
    },
    targetType: String,
    targetId: String,
    ipAddress: String,
    userAgent: String,
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    // Append-only: no updatedAt, since audit log entries are never
    // modified after being written.
    timestamps: { createdAt: true, updatedAt: false },
  },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
