import type { NextFunction, Request, Response } from 'express';
import type {
  ActivityResult,
  OverviewResult,
  RecentActivityResult,
  ResourcesResult,
  SecurityResult,
  SystemHealthResult,
} from '../../types/dashboard.types.js';

export interface IDashboardController {
  overview(req: Request, res: Response, next: NextFunction): Promise<OverviewResult>;

  activity(req: Request, res: Response, next: NextFunction): Promise<ActivityResult>;

  security(req: Request, res: Response, next: NextFunction): Promise<SecurityResult>;

  resources(req: Request, res: Response, next: NextFunction): Promise<ResourcesResult>;

  recentActivity(req: Request, res: Response, next: NextFunction): Promise<RecentActivityResult>;

  systemHealth(req: Request, res: Response, next: NextFunction): Promise<SystemHealthResult>;
}
