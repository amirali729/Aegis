import type { Document, Schema, Types } from 'mongoose';
import mongoose from 'mongoose';

export type MembershipStatus = 'active' | 'suspended';

export interface IMembership extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  status: MembershipStatus;
  joinedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const membershipSchema: Schema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
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
