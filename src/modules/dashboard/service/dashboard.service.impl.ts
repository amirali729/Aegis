import mongoose from 'mongoose';
import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';

import type { IApiKeyRepository } from '../../apikey/repository/interface/apikey.repository.interface.js';
import type { IApplicationRepository } from '../../application/repository/interface/application.repository.interface.js';
import { ListAuditLogsDto } from '../../audit/dto/list-audit-logs.dto.js';
import type { IAuditLogRepository } from '../../audit/repository/interface/audit-log.repository.interface.js';
import { toAuditLogResponse } from '../../audit/service/audit-log-mapper.js';
import type { IAuthRepository } from '../../auth/repository/interface/auth.repository.interface.js';
import type { IMembershipRepository } from '../../membership/repository/interface/membership.repository.interface.js';
import type { IOrganizationRepository } from '../../organizations/repository/interface/organization.repository.interface.js';
import type { IRoleRepository } from '../../role/repository/interface/role.repository.interface.js';
import type { ISessionService } from '../../session/service/interface/session.service.interface.js';
import type { IWebhookRepository } from '../../webhook/repository/interface/webhook.repository.interface.js';

import type { IRole } from '../../role/model/role.model.js';
import type { IOrganization } from '../../organizations/model/organization.model.js';

import { ActivityResponse } from '../responses/activity-response.js';
import type { ActionCount, DailyActivityCount } from '../responses/activity-response.js';
import { OverviewResponse } from '../responses/overview-response.js';
import { RecentActivityResponse } from '../responses/recent-activity-response.js';
import { ResourcesResponse } from '../responses/resources-response.js';
import { SecurityResponse } from '../responses/security-response.js';
import { SystemHealthResponse } from '../responses/system-health-response.js';

import type {
  ActivityResult,
  OverviewResult,
  RecentActivityResult,
  ResourcesResult,
  SecurityResult,
  SystemHealthResult,
} from '../types/dashboard.types.js';
import type { IDashboardService } from './interface/dashboard.service.interface.js';

/** How many days of history the activity widget's daily chart covers. */
const ACTIVITY_CHART_DAYS = 14;
/** How many of an org/user's most recent audit rows we scan in-memory to build the activity chart & top-actions list. Read-only dashboard widget, not a paginated listing - a bounded scan is enough. */
const ACTIVITY_SCAN_LIMIT = 1000;
const TOP_ACTIONS_COUNT = 5;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export class DashboardService implements IDashboardService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly applicationRepository: IApplicationRepository,
    private readonly apiKeyRepository: IApiKeyRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly webhookRepository: IWebhookRepository,
    private readonly sessionService: ISessionService,
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async getOverview(userId: string, tenantId: string | undefined): Promise<OverviewResult> {
    const user = await this.authRepository.findById(userId);
    if (!user.ok) return err(user.error);
    if (!user.value) return err(new InfrastructureError('User not found.'));

    const memberships = await this.membershipRepository.findByUser(userId);
    if (!memberships.ok) return err(memberships.error);

    const organizationsCount = memberships.value.length;

    let currentOrganization: OverviewResponse['currentOrganization'];
    let membersCount: number | undefined;
    let applicationsCount: number | undefined;
    let rolesCount: number | undefined;

    if (tenantId) {
      const org = await this.organizationRepository.findById(tenantId);
      if (!org.ok) return err(org.error);

      if (org.value) {
        const currentMembership = memberships.value.find(
          (m) => (m.organizationId as unknown as IOrganization)._id.toString() === tenantId,
        );
        const roles = ((currentMembership?.roleIds as unknown as IRole[]) ?? []).map(
          (role) => role.name,
        );

        currentOrganization = {
          id: org.value._id.toString(),
          name: org.value.name,
          slug: org.value.slug,
          plan: org.value.plan,
          roles,
        };

        const membersFound = await this.membershipRepository.findByOrganization(tenantId);
        if (!membersFound.ok) return err(membersFound.error);
        membersCount = membersFound.value.filter((m) => m.status === 'active').length;

        const applications = await this.applicationRepository.findAll(tenantId);
        if (!applications.ok) return err(applications.error);
        applicationsCount = applications.value.length;

        const roleList = await this.roleRepository.findAll(tenantId);
        if (!roleList.ok) return err(roleList.error);
        rolesCount = roleList.value.length;
      }
    }

    return ok(
      new OverviewResponse(
        {
          id: user.value._id.toString(),
          username: user.value.username,
          email: user.value.email,
          fullName: user.value.fullName,
          isVerified: user.value.isVerified,
          createdAt: user.value.createdAt,
        },
        organizationsCount,
        currentOrganization,
        membersCount,
        applicationsCount,
        rolesCount,
      ),
    );
  }

  async getActivity(userId: string, tenantId: string | undefined): Promise<ActivityResult> {
    const dto = new ListAuditLogsDto(
      1,
      ACTIVITY_SCAN_LIMIT,
      tenantId ? undefined : userId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      tenantId,
    );

    const found = await this.auditLogRepository.findMany(dto);
    if (!found.ok) return err(found.error);

    const now = new Date();
    const chartStart = startOfDay(new Date(now.getTime() - (ACTIVITY_CHART_DAYS - 1) * 86_400_000));
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

    const dailyMap = new Map<string, number>();
    for (let i = 0; i < ACTIVITY_CHART_DAYS; i++) {
      dailyMap.set(dateKey(new Date(chartStart.getTime() + i * 86_400_000)), 0);
    }

    const actionCounts = new Map<string, number>();
    let totalLast7Days = 0;
    let totalLast30Days = 0;

    for (const log of found.value.logs) {
      if (log.createdAt >= chartStart) {
        const key = dateKey(startOfDay(log.createdAt));
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
      }
      if (log.createdAt >= sevenDaysAgo) totalLast7Days++;
      if (log.createdAt >= thirtyDaysAgo) totalLast30Days++;

      actionCounts.set(log.action, (actionCounts.get(log.action) ?? 0) + 1);
    }

    const dailyCounts: DailyActivityCount[] = Array.from(dailyMap.entries()).map(
      ([date, count]) => ({ date, count }),
    );

    const topActions: ActionCount[] = Array.from(actionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_ACTIONS_COUNT)
      .map(([action, count]) => ({ action, count }));

    return ok(
      new ActivityResponse(dailyCounts, totalLast7Days, totalLast30Days, topActions, !tenantId),
    );
  }

  async getSecurity(userId: string, currentRawRefreshToken?: string): Promise<SecurityResult> {
    const user = await this.authRepository.findById(userId);
    if (!user.ok) return err(user.error);
    if (!user.value) return err(new InfrastructureError('User not found.'));

    const sessions = await this.sessionService.listByUser(userId, currentRawRefreshToken);
    if (!sessions.ok) {
      // ISessionService only ever fails this call with InfrastructureError-shaped
      // issues in practice (no user-facing session id/token in play here).
      return err(new InfrastructureError());
    }

    const lastLogin = await this.auditLogRepository.findMany(
      new ListAuditLogsDto(1, 1, userId, 'auth.login'),
    );
    const lastLoginAt = lastLogin.ok ? lastLogin.value.logs[0]?.createdAt : undefined;

    return ok(
      new SecurityResponse(
        sessions.value,
        sessions.value.length,
        user.value.failedLoginAttempts,
        user.value.isLocked(),
        user.value.lockUntil,
        lastLoginAt,
        user.value.isVerified,
      ),
    );
  }

  async getResources(userId: string, tenantId: string | undefined): Promise<ResourcesResult> {
    const memberships = await this.membershipRepository.findByUser(userId);
    if (!memberships.ok) return err(memberships.error);

    const organizationsCount = memberships.value.length;

    if (!tenantId) {
      return ok(
        new ResourcesResponse(
          organizationsCount,
          0,
          { active: 0, revoked: 0, total: 0 },
          0,
          0,
          undefined,
        ),
      );
    }

    const [applications, roles, webhooks] = await Promise.all([
      this.applicationRepository.findAll(tenantId),
      this.roleRepository.findAll(tenantId),
      this.webhookRepository.findByOrganization(tenantId),
    ]);

    if (!applications.ok) return err(applications.error);
    if (!roles.ok) return err(roles.error);
    if (!webhooks.ok) return err(webhooks.error);

    // ApiKey is scoped to Application, not directly to a tenant - keys
    // are counted by fanning out over this tenant's applications. Fine
    // at dashboard scale (a handful of applications per organization);
    // would need a dedicated aggregation if that stops being true.
    let active = 0;
    let revoked = 0;

    const keysByApplication = await Promise.all(
      applications.value.map((application) =>
        this.apiKeyRepository.findByApplicationId(application._id.toString()),
      ),
    );

    for (const result of keysByApplication) {
      if (!result.ok) return err(result.error);
      for (const key of result.value) {
        if (key.status === 'active') active++;
        else revoked++;
      }
    }

    return ok(
      new ResourcesResponse(
        organizationsCount,
        applications.value.length,
        { active, revoked, total: active + revoked },
        roles.value.length,
        webhooks.value.length,
        tenantId,
      ),
    );
  }

  async getRecentActivity(
    userId: string,
    tenantId: string | undefined,
    limit: number,
  ): Promise<RecentActivityResult> {
    const dto = new ListAuditLogsDto(
      1,
      limit,
      tenantId ? undefined : userId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      tenantId,
    );

    const found = await this.auditLogRepository.findMany(dto);
    if (!found.ok) return err(found.error);

    return ok(
      new RecentActivityResponse(
        found.value.logs.map(toAuditLogResponse),
        found.value.total,
        !tenantId,
      ),
    );
  }

  async getSystemHealth(): Promise<SystemHealthResult> {
    // Deliberately mirrors shared/http/health.router.ts's DB check
    // rather than importing it - that router has no service layer to
    // depend on (it's a raw Express handler), and duplicating one
    // readyState check here is simpler than refactoring it into one.
    const dbConnected = mongoose.connection.readyState === 1;

    const memoryUsage = process.memoryUsage();
    const toMB = (bytes: number) => Math.round((bytes / (1024 * 1024)) * 100) / 100;

    return ok(
      new SystemHealthResponse(
        dbConnected ? 'ok' : 'degraded',
        process.uptime(),
        dbConnected ? 'connected' : 'disconnected',
        process.env.NODE_ENV ?? 'development',
        process.version,
        {
          rssMB: toMB(memoryUsage.rss),
          heapUsedMB: toMB(memoryUsage.heapUsed),
          heapTotalMB: toMB(memoryUsage.heapTotal),
        },
        new Date().toISOString(),
      ),
    );
  }
}
