import type { Document, Schema, Types } from 'mongoose';
import mongoose from 'mongoose';

export type MembershipStatus = 'active' | 'suspended';

export interface IMembership extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  status: MembershipStatus;
  /**
   * Organization-scoped Role documents (modules/role) granted to this
   * user WITHIN this organization. A membership can hold multiple
   * roles at once - the effective permission set is the union of all
   * of them (see permission-evaluator.ts).
   *
   * This is now the ONLY place org-level roles are attached - User no
   * longer has a `roles` field. Membership is the permission boundary:
   * User -> Membership -> Organization -> Role[], matching the target
   * architecture (see docs, section 9: Membership Architecture).
   */
  roleIds: Types.ObjectId[];
  joinedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const membershipSchema: Schema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      // Mongoose model is registered as "Tenant" (see
      // organizations/model/organization.model.ts) even though the
      // module/type layer calls it Organization - ref must match the
      // registered model name or populate('organizationId') throws
      // MissingSchemaError.
      ref: 'Tenant',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    roleIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Role',
        },
      ],
      default: [],
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// A user can only have one membership record per organization.
membershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export const Membership = mongoose.model<IMembership>('Membership', membershipSchema);
