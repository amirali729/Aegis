import { Logger } from '../utils/logger.js';
import type { DomainEvent } from './domain-event.js';
import type { EventHandler, IEventBus, Unsubscribe } from './event-bus.interface.js';

const WILDCARD = '*';

/**
 * In-process implementation of IEventBus. This is intentionally the
 * ONLY thing that would need to change to move from "events dispatched
 * synchronously within this Node process" to "events published onto
 * RabbitMQ/Kafka/SQS and consumed by a separate worker" - every business
 * module depends on the IEventBus interface, not this class, so that
 * swap is a wiring change (whatever constructs the exported singleton in
 * event-bus.ts) rather than a rewrite of every publisher.
 *
 * Known limitation, stated plainly rather than hidden: events published
 * here live only in process memory. If the process crashes between
 * publish() being called and a subscriber finishing its work, that
 * delivery is lost - there is no persistence or replay. This is exactly
 * the gap a real broker closes, and exactly why business modules must
 * never be written to assume events are durable today (see the
 * DomainEvent doc comment on why the envelope is already
 * broker-friendly, ready for that swap).
 */
export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, Set<EventHandler<never>>>();

  publish<TPayload>(event: DomainEvent<TPayload>): void {
    // Never blocks the caller - the business operation that published
    // this event has already effectively "returned" by the time any
    // subscriber runs. setImmediate (rather than a synchronous call or
    // even queueMicrotask) deliberately defers dispatch until after the
    // current operation - including sending its HTTP response - has had
    // a chance to complete.
    setImmediate(() => {
      void this.dispatch(event);
    });
  }

  subscribe<TPayload>(eventType: string, handler: EventHandler<TPayload>): Unsubscribe {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const set = this.handlers.get(eventType)!;
    set.add(handler as EventHandler<never>);

    return () => {
      set.delete(handler as EventHandler<never>);
    };
  }

  private async dispatch<TPayload>(event: DomainEvent<TPayload>): Promise<void> {
    const exact = this.handlers.get(event.type) ?? new Set();
    const wildcard = this.handlers.get(WILDCARD) ?? new Set();
    const allHandlers = [...exact, ...wildcard] as EventHandler<TPayload>[];

    if (allHandlers.length === 0) return;

    // Promise.allSettled, not Promise.all - one subscriber
    // throwing/rejecting must never prevent any other subscriber for
    // this same event from running, and must never surface as an
    // unhandled rejection anywhere the publisher would see it.
    await Promise.allSettled(allHandlers.map((handler) => this.runHandlerSafely(handler, event)));
  }

  private async runHandlerSafely<TPayload>(
    handler: EventHandler<TPayload>,
    event: DomainEvent<TPayload>,
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      // Logged, never re-thrown or allowed to reject upward - a failing
      // subscriber (a webhook dispatcher that's temporarily down, a
      // notification service erroring) must never crash the application
      // or affect any other subscriber. A future iteration should route
      // this through structured logging with alerting rather than a
      // bare console.error - tracked as follow-up, not hidden.
      Logger.error(
        `[EventBus] subscriber failed for event "${event.type}" (id: ${event.id})`,
        error,
      );
    }
  }
}
