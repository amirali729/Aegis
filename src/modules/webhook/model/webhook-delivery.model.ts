import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export type WebhookDeliveryStatus =
  'pending' | 'delivering' | 'delivered' | 'failed' | 'dead_letter';

/**
 * One row per (webhook, domain event) pair - NOT per HTTP attempt.
 * `attempts` increments as retries happen; the row itself IS the
 * delivery history entry the "Delivery History"/"Delivery Status"/"Last
 * Successful/Failed Delivery" requirements refer to. Manual redelivery
 * (see webhook.routes.ts) resets an existing row rather than creating a
 * new one, so history for a given event stays in one place.
 */
export interface IWebhookDelivery extends Document {
  webhookId: Types.ObjectId;
  /** Denormalized from Webhook.organizationId - lets delivery-history queries and the dispatcher's isolation check both filter without an extra join. */
  organizationId: Types.ObjectId;
  eventId: string;
  eventType: string;
  /** The exact WebhookEventPayload (see mapper/webhook-event.mapper.ts) that was/will be sent - stored so a manual redelivery re-sends the SAME body, and so delivery history is inspectable without needing the original DomainEvent still around. */
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt?: Date | null;
  lastAttemptAt?: Date | null;
  responseStatus?: number | null;
  /** Truncated - never store an unbounded response body from an arbitrary customer endpoint. */
  responseBody?: string | null;
  errorMessage?: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const webhookDeliverySchema: Schema = new mongoose.Schema(
  {
    webhookId: {
      type: Schema.Types.ObjectId,
      ref: 'Webhook',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'delivering', 'delivered', 'failed', 'dead_letter'],
      default: 'pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 6,
    },
    nextAttemptAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    responseStatus: {
      type: Number,
      default: null,
    },
    responseBody: {
      type: String,
      default: null,
      maxlength: 2000,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Idempotency: the same (webhook, event) pair is one delivery row, ever
// - guards against double-enqueueing the same event to the same webhook
// (e.g. a future queue-backed Event Bus redelivering after a worker
// crash/restart, per its own at-least-once semantics).
webhookDeliverySchema.index({ webhookId: 1, eventId: 1 }, { unique: true });

export const WebhookDelivery = mongoose.model<IWebhookDelivery>(
  'WebhookDelivery',
  webhookDeliverySchema,
);
