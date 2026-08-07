import type { NextFunction, Request, Response } from 'express';
import type { IDashboardService } from '../service/interface/dashboard.service.interface.js';
import type {
  ActivityResult,
  OverviewResult,
  RecentActivityResult,
  ResourcesResult,
  SecurityResult,
  SystemHealthResult,
} from '../types/dashboard.types.js';
import type { IDashboardController } from './interface/dashboard.controller.interface.js';

const DEFAULT_RECENT_ACTIVITY_LIMIT = 10;

export class DashboardController implements IDashboardController {
  constructor(private readonly service: IDashboardService) {}

  async overview(req: Request, _res: Response, _next: NextFunction): Promise<OverviewResult> {
    return this.service.getOverview(req.user._id.toString(), req.tenantId);
  }

  async activity(req: Request, _res: Response, _next: NextFunction): Promise<ActivityResult> {
    return this.service.getActivity(req.user._id.toString(), req.tenantId);
  }

  async security(req: Request, _res: Response, _next: NextFunction): Promise<SecurityResult> {
    return this.service.getSecurity(req.user._id.toString(), req.cookies?.refreshToken);
  }

  async resources(req: Request, _res: Response, _next: NextFunction): Promise<ResourcesResult> {
    return this.service.getResources(req.user._id.toString(), req.tenantId);
  }

  async recentActivity(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<RecentActivityResult> {
    const limit = req.query.limit ? Number(req.query.limit) : DEFAULT_RECENT_ACTIVITY_LIMIT;

    return this.service.getRecentActivity(req.user._id.toString(), req.tenantId, limit);
  }

  async systemHealth(
    _req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<SystemHealthResult> {
    return this.service.getSystemHealth();
  }
}
