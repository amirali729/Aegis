import { Logger } from '../utils/logger.js';
import type { IEventBus } from './event-bus.interface.js';
import { InMemoryEventBus } from './in-memory-event-bus.js';

/**
 * THE single Event Bus instance for the entire backend - every business
 * module that publishes a domain event imports `eventBus` from here,
 * never `InMemoryEventBus` directly. That's what makes swapping the
 * transport later (RabbitMQ/Kafka/SQS) a one-line change in this file
 * rather than a change everywhere events are published.
 */
export const eventBus: IEventBus = new InMemoryEventBus();

/**
 * Default subscriber, registered for every event type via the '*'
 * wildcard: structured logging. This is intentionally the ONLY
 * subscriber wired up in this phase - the Webhook Dispatcher (Phase 3c)
 * subscribes the exact same way (eventBus.subscribe(type, handler) or
 * eventBus.subscribe('*', handler)), it just doesn't exist yet. Nothing
 * about this bus needs to change when it's added.
 */
eventBus.subscribe('*', (event) => {
  Logger.info('[DomainEvent]', {
    id: event.id,
    type: event.type,
    organizationId: event.organizationId,
    actorId: event.actorId,
    occurredAt: event.occurredAt.toISOString(),
  });
});
