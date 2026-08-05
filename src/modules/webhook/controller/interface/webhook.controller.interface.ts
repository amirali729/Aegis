import type { NextFunction, Request, Response } from 'express';
import type {
  DeleteWebhookResult,
  RedeliverWebhookResult,
  RotateWebhookSecretResult,
  WebhookCreatedResult,
  WebhookDeliveryListResult,
  WebhookListResult,
  WebhookResult,
} from '../../types/webhook.types.js';

export interface IWebhookController {
  list(req: Request, res: Response, next: NextFunction): Promise<WebhookListResult>;
  create(req: Request, res: Response, next: NextFunction): Promise<WebhookCreatedResult>;
  update(req: Request, res: Response, next: NextFunction): Promise<WebhookResult>;
  rotateSecret(req: Request, res: Response, next: NextFunction): Promise<RotateWebhookSecretResult>;
  enable(req: Request, res: Response, next: NextFunction): Promise<WebhookResult>;
  disable(req: Request, res: Response, next: NextFunction): Promise<WebhookResult>;
  delete(req: Request, res: Response, next: NextFunction): Promise<DeleteWebhookResult>;
  listDeliveries(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<WebhookDeliveryListResult>;
  redeliver(req: Request, res: Response, next: NextFunction): Promise<RedeliverWebhookResult>;
}
