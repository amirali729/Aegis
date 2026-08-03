import { eventBus } from '../../../shared/events/event-bus.js';
import { auditService } from '../../audit/routes/audit.routes.js';
import { WebhookDeliveryRepository } from '../repository/webhook-delivery.repository.impl.js';
import { WebhookRepository } from '../repository/webhook.repository.impl.js';
import { InMemoryWebhookDeliveryQueue } from './webhook-delivery-queue.js';
import { WebhookDeliveryWorker } from './webhook-delivery-worker.js';
import { WebhookDispatcher } from './webhook-dispatcher.js';

/**
 * Wires the whole delivery pipeline together and subscribes it to the
 * Event Bus. Called exactly once, at process boot (see app.ts) - this is
 * the ONLY place that constructs a WebhookDispatcher, so there's exactly
 * one dispatcher subscribed to the bus, not one per request or per
 * module import.
 */
export function bootstrapWebhookDelivery(): void {
  const webhookRepository = new WebhookRepository();
  const deliveryRepository = new WebhookDeliveryRepository();
  const worker = new WebhookDeliveryWorker(webhookRepository, deliveryRepository, auditService);

  const deliveryQueue = new InMemoryWebhookDeliveryQueue(
    (deliveryId) => worker.attemptDelivery(deliveryId),
    deliveryRepository,
  );
  deliveryQueue.startRetrySweep();

  const dispatcher = new WebhookDispatcher(webhookRepository, deliveryRepository, deliveryQueue);
  dispatcher.subscribeTo(eventBus);
}
