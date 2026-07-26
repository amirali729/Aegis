import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export type ApiKeyStatus = 'active' | 'revoked';

export interface IApiKey extends Document {
  applicationId: Types.ObjectId;
  name: string;
  /** First few characters of the raw key, kept in plaintext for display/identification (e.g. "sk_live_ab12cd34..."). Never enough to reconstruct the key. */
  keyPrefix: string;
  /** SHA-256 hash of the full raw key. The raw key itself is never stored. */
  hashedKey: string;
  status: ApiKeyStatus;
  expiresAt?: Date;
  lastUsedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const apiKeySchema: Schema = new mongoose.Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    keyPrefix: {
      type: String,
      required: true,
    },
    hashedKey: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
