import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export type OAuthClientType = 'confidential' | 'public';
export type OAuthClientStatus = 'active' | 'revoked';

/**
 * An OAuth 2.1 / OIDC client, belonging to exactly one Application (see
 * System Architecture doc, section 7 - Application Module: Application is
 * the developer-facing boundary, and OAuth Clients are one of the
 * resources that live underneath it). Scoping is inherited transitively
 * through applicationId -> Application.tenantId rather than duplicating
 * an organizationId field here - see the repository layer for how
 * ownership checks walk that chain.
 */
export interface IOAuthClient extends Document {
  applicationId: Types.ObjectId;
  name: string;
  clientId: string;
  /**
   * Only present for confidential clients. Public clients (SPAs, mobile
   * apps - anything that can't keep a secret) never receive one and must
   * use PKCE (S256) on the authorization code flow instead - see the
   * upcoming Authorization Code module.
   */
  clientSecretHash?: string;
  clientType: OAuthClientType;
  redirectUris: string[];
  /** e.g. ["authorization_code", "refresh_token", "client_credentials"] */
  grantTypes: string[];
  /** e.g. ["openid", "profile", "email"] */
  scopes: string[];
  status: OAuthClientStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const oauthClientSchema: Schema = new mongoose.Schema(
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
    clientId: {
      type: String,
      required: true,
      unique: true,
    },
    clientSecretHash: {
      type: String,
    },
    clientType: {
      type: String,
      enum: ['confidential', 'public'],
      default: 'confidential',
    },
    redirectUris: {
      type: [String],
      default: [],
    },
    grantTypes: {
      type: [String],
      default: ['authorization_code', 'refresh_token'],
    },
    scopes: {
      type: [String],
      default: ['openid', 'profile', 'email'],
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
  },
  { timestamps: true },
);

export const OAuthClient = mongoose.model<IOAuthClient>('OAuthClient', oauthClientSchema);
