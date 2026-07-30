import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IRole extends Document {
  /** Null in single-tenant self-hosted deployments (MULTI_TENANT=false). */
  tenantId?: Types.ObjectId;
  name: string;
  description?: string;
  permissions: Types.ObjectId[];
  /**
   * System roles (seeded by the platform, e.g. "Admin") can't be
   * deleted or renamed through the API - only their permission set
   * can be adjusted. Prevents an operator from accidentally locking
   * themselves out of their own instance.
   */
  isSystem: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const roleSchema: Schema = new mongoose.Schema(
  {
    // Field kept as "tenantId" (pre-dates the Organization rename) but
    // points at the Organization collection - Organization IS the tenant.
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Permission',
        },
      ],
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Uniqueness scoped per tenant, same rationale as Permission.key -
// otherwise one tenant creating "Admin" would block every other tenant
// from ever having an "Admin" role.
roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const Role = mongoose.model<IRole>('Role', roleSchema);
