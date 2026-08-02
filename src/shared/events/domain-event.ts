import crypto from 'crypto';

/**
 * The envelope every domain event carries, regardless of what module
 * published it or what eventually consumes it (structured logging today;
 * the Webhook Dispatcher, Notifications, Analytics, and Audit
 * integrations in later phases - see event-bus.ts).
 *
 * Deliberately plain-data and JSON-serializable (no class instances, no
 * Mongoose documents) - this is what makes it "durable enough for future
 * queue implementations" (per the architecture brief): the exact same
 * shape that gets handed to an in-process subscriber today is what would
 * get JSON.stringify'd onto a RabbitMQ/Kafka/SQS message tomorrow,
 * without needing to redesign the envelope when that swap happens.
 */
export interface DomainEvent<TPayload = Record<string, unknown>> {
  /** Unique per publish - lets a future durable queue / webhook delivery layer deduplicate reliably. */
  id: string;
  /** e.g. "organization.created" - see domain-events.ts for the full, agreed vocabulary. */
  type: string;
  occurredAt: Date;
  /**
   * Present for every organization-scoped event, absent for
   * platform-level ones (e.g. a bare user.login isn't inherently about
   * any one organization). This is the field the Webhook Dispatcher
   * (Phase 3c) filters delivery on - a webhook belonging to Organization
   * A must never receive an event whose organizationId is Organization
   * B's, or is undefined for a platform-level event it has no business
   * seeing.
   */
  organizationId?: string;
  /** Who/what caused this event - mirrors the actorId convention already used throughout audit logging. */
  actorId?: string;
  payload: TPayload;
}

export function createDomainEvent<TPayload>(
  type: string,
  payload: TPayload,
  options?: { organizationId?: string; actorId?: string },
): DomainEvent<TPayload> {
  return {
    id: crypto.randomUUID(),
    type,
    occurredAt: new Date(),
    organizationId: options?.organizationId,
    actorId: options?.actorId,
    payload,
  };
}
