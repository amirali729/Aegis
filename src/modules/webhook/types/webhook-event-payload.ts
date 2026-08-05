/**
 * The public, external-facing shape of an event as delivered to a
 * customer's webhook endpoint.
 *
 * This is deliberately a SEPARATE, NARROWER contract from the internal
 * `DomainEvent` envelope (`shared/events/domain-event.ts`). Internal
 * routing metadata - `organizationId`, `actorId` - must never leak into
 * what a customer's endpoint receives; those fields describe how Aegis
 * routed the event internally, not something a third-party integration
 * has any business seeing or depending on.
 *
 * `mapper/webhook-event.mapper.ts`'s `toWebhookEventPayload()` is the
 * ONLY function allowed to translate a `DomainEvent` into this shape.
 */
export interface WebhookEventPayload<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Unique id of the underlying domain event (also used for delivery idempotency). */
  id: string;
  /** The event type string, e.g. "organization.created". */
  event: string;
  /** ISO-8601 timestamp string of when the event occurred. */
  created_at: string;
  /** The event's payload - exactly the DomainEvent's `payload`, nothing more. */
  data: TPayload;
}
