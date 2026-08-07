import type {
  ActivityResult,
  OverviewResult,
  RecentActivityResult,
  ResourcesResult,
  SecurityResult,
  SystemHealthResult,
} from '../../types/dashboard.types.js';

export interface IDashboardService {
  getOverview(userId: string, tenantId: string | undefined): Promise<OverviewResult>;

  getActivity(userId: string, tenantId: string | undefined): Promise<ActivityResult>;

  getSecurity(userId: string, currentRawRefreshToken?: string): Promise<SecurityResult>;

  getResources(userId: string, tenantId: string | undefined): Promise<ResourcesResult>;

  getRecentActivity(
    userId: string,
    tenantId: string | undefined,
    limit: number,
  ): Promise<RecentActivityResult>;

  getSystemHealth(): Promise<SystemHealthResult>;
}
