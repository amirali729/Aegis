import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

/**
 * An OAuth 2.1 authorization code. Short-lived (2 minutes - well under
 * the RFC 6749 recommended 10-minute max) and single-use by design
 * (`used`, flipped on the one legitimate exchange - see the token
 * endpoint, Phase 2c). Stored hashed, the same way Session stores its
 * refresh tokens and ApiKey/Application store their secrets - the raw
 * code only ever exists in the redirect URL sent back to the client and
 * in the client's subsequent token-exchange request body, never at rest.
 */
export interface IAuthorizationCode extends Document {
  codeHash: string;
  clientId: Types.ObjectId;
  userId: Types.ObjectId;
  redirectUri: string;
  scopes: string[];
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  used: boolean;
  /**
   * Set at the moment tokens are issued from this code (see
   * OAuthTokenService.exchangeAuthorizationCode). Lets a detected reuse
   * of this code cascade-revoke whatever it legitimately issued the
   * first time, per RFC 6749 section 10.5 - a code being presented a
   * second time is a strong signal the first, legitimate token pair was
   * intercepted, so both are revoked defensively rather than just
   * rejecting the replay attempt and leaving the original tokens live.
   */
  issuedAccessTokenId?: Types.ObjectId;
  issuedRefreshTokenId?: Types.ObjectId;
  expiresAt: Date;
  readonly createdAt: Date;
}

const authorizationCodeSchema: Schema = new mongoose.Schema(
  {
    codeHash: {
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
    redirectUri: {
      type: String,
      required: true,
    },
    scopes: {
      type: [String],
      default: [],
    },
    codeChallenge: {
      type: String,
      required: true,
    },
    codeChallengeMethod: {
      type: String,
      enum: ['S256'],
      default: 'S256',
    },
    used: {
      type: Boolean,
      default: false,
    },
    issuedAccessTokenId: {
      type: Schema.Types.ObjectId,
      ref: 'OAuthAccessToken',
    },
    issuedRefreshTokenId: {
      type: Schema.Types.ObjectId,
      ref: 'OAuthRefreshToken',
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index - Mongo automatically deletes expired, unused codes.
      // Used codes are also short-lived by the same TTL rather than kept
      // indefinitely - the token endpoint (Phase 2c) is expected to log
      // a reuse attempt as a security event before that cleanup runs,
      // not rely on the row persisting for later forensics.
      expires: 0,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AuthorizationCode = mongoose.model<IAuthorizationCode>(
  'AuthorizationCode',
  authorizationCodeSchema,
);
