import type { Document, Schema, Types } from 'mongoose';
import mongoose from 'mongoose';

/**
 * Permission keys follow a "resource:action" convention, e.g. "user:view",
 * "role:create". See docs/Authorization Architecture.md section 8-9.
 */
export interface IPermission extends Document {
  /** Null in single-tenant self-hosted deployments (MULTI_TENANT=false). */
  tenantId?: Types.ObjectId;
  key: string;
  description?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const permissionSchema: Schema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    key: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9_]+:[a-z0-9_]+$/,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// Uniqueness is scoped per tenant (so two tenants can each have their
// own "user:view" permission) rather than globally, which is what
// actually leaked before - one tenant's key claim blocked every other
// tenant. In single-tenant deployments tenantId is always undefined for
// every document, so this behaves exactly like the old global-unique
// index.
permissionSchema.index({ tenantId: 1, key: 1 }, { unique: true });

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);
