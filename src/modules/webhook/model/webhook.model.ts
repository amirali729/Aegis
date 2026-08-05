import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export type WebhookStatus = 'active' | 'disabled';

/**
 * A customer's subscription to organization-wide domain events,
 * delivered to their own HTTP endpoint. Belongs to exactly one
 * Organization - not nested under Application, since webhooks subscribe
 * to events at the organization level (member changes, role changes,
 * etc.), most of which have no single owning Application at all.
 */
export interface IWebhook extends Document {
  organizationId: Types.ObjectId;
  name: string;
  url: string;
  /**
   * AES-256-GCM encrypted (see shared/security/encryption/
   * symmetric-encryption.ts), NOT hashed - unlike every other secret in
   * this codebase, the delivery worker (Phase 3c) needs the ORIGINAL
   * value back to compute an HMAC-SHA256 signature on every outgoing
   * request. A one-way hash would make that impossible.
   */
  secretEncrypted: string;
  status: WebhookStatus;
  /** DOMAIN_EVENTS type strings this webhook wants, or ['*'] for every event. */
  subscribedEvents: string[];
  lastSuccessAt?: Date | null;
  lastFailureAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const webhookSchema: Schema = new mongoose.Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    secretEncrypted: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
    subscribedEvents: {
      type: [String],
      default: [],
    },
    lastSuccessAt: {
      type: Date,
      default: null,
    },
    lastFailureAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Webhook = mongoose.model<IWebhook>('Webhook', webhookSchema);
