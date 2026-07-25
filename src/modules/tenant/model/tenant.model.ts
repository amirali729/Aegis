import type { Schema, Document } from 'mongoose';
import mongoose from 'mongoose';

export type TenantStatus = 'active' | 'suspended';
export type TenantPlan = 'free' | 'pro' | 'enterprise';

export interface ITenant extends Document {
  name: string;
  slug: string;
  status: TenantStatus;
  plan: TenantPlan;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const tenantSchema: Schema = new mongoose.Schema(
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

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);
