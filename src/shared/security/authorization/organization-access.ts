import { User } from '../../../modules/auth/model/user.model.js';
import { Membership } from '../../../modules/membership/model/membership.model.js';

/**
 * True if the user holds an elevated platform role (owner/admin/support
 * - see platform-roles.ts), set up via bootstrap/assign-admin.ts or
 * promoted by a Platform Owner. Trusted to act on any organization
 * rather than only ones they're an explicit Member of.
 *
 * Single source of truth for this check - resolveTenant.middleware.ts
 * and every org-scoped service's ownership check import this rather
 * than each keeping their own copy (a previous audit found the
 * middleware's copy and the services having none at all, which is how
 * the cross-organization IDOR below went unnoticed for so long).
 */
export async function isPlatformOperator(userId: string): Promise<boolean> {
  const user = await User.findById(userId).select('platformRole');

  if (!user) return false;

  return user.platformRole !== 'user';
}

/**
 * True if `callerId` may act on organization `organizationId`.
 *
 * THE BUG THIS REPLACES: every org-scoped service (Organizations,
 * Webhook, Membership, Invitation, Role) used to implement this as
 * `callerTenantId === undefined || callerTenantId === organizationId`.
 * `callerTenantId` (req.tenantId) is undefined whenever the caller
 * simply doesn't send an X-Tenant-ID header - which is the NORMAL case
 * for every request in a single-tenant deployment (MULTI_TENANT=false),
 * and is trivially true for ANY multi-tenant request too, since the
 * header is optional there as well. The old check's `undefined ⇒ true`
 * branch was written assuming "no resolved tenant" meant "there is only
 * one organization, so there is nothing to isolate" - which is false:
 * this architecture lets any user create any number of organizations
 * regardless of MULTI_TENANT, and a member of Org A's `role:update`
 * permission (earned via THEIR OWN Membership -> Role) is just a bare
 * string in their permission Set with no org attached to it - nothing
 * stopped them pointing that permission at Org B's :organizationId in
 * the URL and having the "ownership" check wave it through.
 *
 * The fix: when no tenant header was sent, don't assume "unrestricted"
 * - independently verify the caller has their own ACTIVE Membership in
 * the SPECIFIC organization the request targets. When a tenant IS
 * resolved, `resolveTenant.middleware.ts` has already verified that
 * membership (or that the caller is a platform operator) before
 * setting req.tenantId, so exact equality is - and always was - safe.
 *
 * `allowPlatformOperator` should only be true for modules the Roles &
 * Permissions doc explicitly grants Platform Owner/Admin/Support
 * cross-organization access to (Organizations, Users). It is NOT set
 * for Webhook/Membership/Invitation/Role - the doc does not grant
 * platform roles direct access to another organization's webhooks,
 * members, invitations, or custom role definitions, so a platform
 * operator wanting to act on those still needs their own Membership in
 * that org, same as anyone else.
 */
export async function callerBelongsToOrganization(
  organizationId: string,
  callerTenantId: string | undefined,
  callerId: string,
  options: { allowPlatformOperator?: boolean } = {},
): Promise<boolean> {
  if (callerTenantId !== undefined) {
    return callerTenantId === organizationId;
  }

  if (options.allowPlatformOperator && (await isPlatformOperator(callerId))) {
    return true;
  }

  const membership = await Membership.findOne({
    userId: callerId,
    organizationId,
    status: 'active',
  });

  return !!membership;
}
