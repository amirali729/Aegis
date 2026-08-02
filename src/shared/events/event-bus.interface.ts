import type { DomainEvent } from './domain-event.js';

export type EventHandler<TPayload = Record<string, unknown>> = (
  event: DomainEvent<TPayload>,
) => Promise<void> | void;

/** Returned by subscribe() - call it to unsubscribe. */
export type Unsubscribe = () => void;

/**
 * The single publish/subscribe abstraction every business module and
 * every consumer (structured logging today; the Webhook Dispatcher,
 * Notifications, Analytics, and Audit in later phases) depends on.
 *
 * Business modules call ONLY publish() and never know or care who's
 * subscribed, whether it's an in-memory dispatch or a message broker
 * round-trip, or how many subscribers exist. This is what "business
 * modules must never call webhook code directly" actually means in
 * code: OrganizationService imports IEventBus, never anything from
 * modules/webhook.
 *
 * Implementations MUST guarantee:
 *  - publish() never throws and never blocks the caller - a failure to
 *    dispatch to a subscriber is the subscriber's problem, not the
 *    publisher's, and is never allowed to propagate back as an error
 *    from the business operation that published the event.
 *  - One subscriber throwing/rejecting must never prevent any other
 *    subscriber for the same event from running.
 */
export interface IEventBus {
  publish<TPayload>(event: DomainEvent<TPayload>): void;

  /**
   * eventType: an exact type string (e.g. "organization.created") or '*'
   * to receive every event regardless of type (used by the default
   * structured-logging subscriber - see event-bus.ts).
   */
  subscribe<TPayload>(eventType: string, handler: EventHandler<TPayload>): Unsubscribe;
}
