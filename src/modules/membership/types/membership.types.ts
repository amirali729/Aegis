import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { OrganizationNotFoundError } from '../../organizations/errors/organization-not-found.error.js';
import type { AlreadyMemberError } from '../errors/already-member.error.js';
import type { MemberNotFoundError } from '../errors/member-not-found.error.js';
import type { MemberResponse } from '../responses/member.response.js';

export type MembershipError =
  OrganizationNotFoundError | MemberNotFoundError | AlreadyMemberError | InfrastructureError;

export type MemberResult = Result<MemberResponse, MembershipError>;

export type MemberListResult = Result<MemberResponse[], MembershipError>;

export type RemoveMemberResult = Result<{ message: string }, MembershipError>;
