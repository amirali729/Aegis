import type { Document, Schema } from 'mongoose';
import mongoose from 'mongoose';

export type OrganizaionStatus = 'active' | 'suspended';
export type OrganizationPlan = 'free' | 'pro' | 'enterprise';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  status: OrganizaionStatus;
  plan: OrganizationPlan;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const OrganizationSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
  },
  { timestamps: true },
);

export const Tenant = mongoose.model<IOrganization>('Tenant', OrganizationSchema);
