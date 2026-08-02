import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

/**
 * Records that a user has approved a client to act on their behalf for a
 * given set of scopes. Checked on every /oauth/authorize request (see
 * authorize.service.impl.ts): if the requested scopes are already fully
 * covered by an existing consent record, the user isn't re-prompted -
 * standard OAuth UX (Google/GitHub/etc. all behave this way). If the
 * client later requests a BROADER scope set than previously approved,
 * consent is required again for the new scopes.
 */
export interface IOAuthConsent extends Document {
  userId: Types.ObjectId;
  clientId: Types.ObjectId;
  scopes: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const oauthConsentSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'OAuthClient',
      required: true,
      index: true,
    },
    scopes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

// One consent record per (user, client) pair - scopes accumulate onto it
// rather than creating a new record per approval.
oauthConsentSchema.index({ userId: 1, clientId: 1 }, { unique: true });

export const OAuthConsent = mongoose.model<IOAuthConsent>('OAuthConsent', oauthConsentSchema);
