import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IApplication extends Document {
  /** Null in single-tenant self-hosted deployments (MULTI_TENANT=false). */
  tenantId?: Types.ObjectId;
  name: string;
  clientId: string;
  clientSecretHash: string;
  allowedOrigins: string[];
  redirectUris: string[];
  accessTokenTTL: string;
  refreshTokenTTL: string;
  isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const applicationSchema: Schema = new mongoose.Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    clientId: {
      type: String,
      required: true,
      unique: true,
    },
    clientSecretHash: {
      type: String,
      required: true,
    },
    allowedOrigins: {
      type: [String],
      default: [],
    },
    redirectUris: {
      type: [String],
      default: [],
    },
    accessTokenTTL: {
      type: String,
      default: '15m',
    },
    refreshTokenTTL: {
      type: String,
      default: '7d',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
