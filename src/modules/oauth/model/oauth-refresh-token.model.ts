import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

/**
 * An OAuth refresh token. Rotated IN PLACE on every use - the same
 * pattern Session already uses for its own refresh tokens
 * (session.service.impl.ts, rotateSession): the document's tokenHash is
 * overwritten with a new hash rather than creating a new document per
 * refresh. This makes "the old token no longer works" automatic (its
 * hash simply doesn't exist anymore) without needing a separate `used`
 * flag or a parent-chain to walk.
 */
export interface IOAuthRefreshToken extends Document {
  tokenHash: string;
  clientId: Types.ObjectId;
  userId: Types.ObjectId;
  scopes: string[];
  expiresAt: Date;
  revokedAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const oauthRefreshTokenSchema: Schema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'OAuthClient',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scopes: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Automatically delete expired refresh tokens.
oauthRefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OAuthRefreshToken = mongoose.model<IOAuthRefreshToken>(
  'OAuthRefreshToken',
  oauthRefreshTokenSchema,
);
