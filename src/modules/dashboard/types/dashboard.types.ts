import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { ActivityResponse } from '../responses/activity-response.js';
import type { OverviewResponse } from '../responses/overview-response.js';
import type { RecentActivityResponse } from '../responses/recent-activity-response.js';
import type { ResourcesResponse } from '../responses/resources-response.js';
import type { SecurityResponse } from '../responses/security-response.js';
import type { SystemHealthResponse } from '../responses/system-health-response.js';

/**
 * Every widget behind these endpoints is a read-only aggregation over
 * data that already exists (and is already access-controlled) in other
 * modules - there's nothing here for a user to get wrong, so
 * InfrastructureError ("couldn't reach the database") is the only
 * failure mode this module itself introduces.
 */
export type DashboardError = InfrastructureError;

export type OverviewResult = Result<OverviewResponse, DashboardError>;

export type ActivityResult = Result<ActivityResponse, DashboardError>;

export type SecurityResult = Result<SecurityResponse, DashboardError>;

export type ResourcesResult = Result<ResourcesResponse, DashboardError>;

export type RecentActivityResult = Result<RecentActivityResponse, DashboardError>;

export type SystemHealthResult = Result<SystemHealthResponse, DashboardError>;
