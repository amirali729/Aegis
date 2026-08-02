import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

/**
 * An issued OAuth access token. Opaque and hashed at rest - the same
 * convention Session/ApiKey/Application already use for their secrets
 * in this codebase - rather than a self-contained JWT. Third-party
 * clients validate it by calling /oauth/introspect (RFC 7662), not by
 * verifying a signature locally. (ID Tokens, when OIDC support is added
 * in a later phase, will be JWTs - that's a spec requirement for ID
 * Tokens specifically, not for access tokens.)
 */
export interface IOAuthAccessToken extends Document {
  tokenHash: string;
  clientId: Types.ObjectId;
  userId: Types.ObjectId;
  scopes: string[];
  expiresAt: Date;
  revokedAt?: Date | null;
  readonly createdAt: Date;
}

const oauthAccessTokenSchema: Schema = new mongoose.Schema(
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
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Automatically delete expired access tokens.
oauthAccessTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OAuthAccessToken = mongoose.model<IOAuthAccessToken>(
  'OAuthAccessToken',
  oauthAccessTokenSchema,
);
