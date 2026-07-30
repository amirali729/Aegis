import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { EmailAlreadyExistsError } from '../../auth/errors/email-already-exists.error.js';
import type { UsernameAlreadyExistsError } from '../../auth/errors/username-already-exists.error.js';
import type { AlreadyMemberError } from '../../membership/errors/already-member.error.js';
import type { OrganizationNotFoundError } from '../../organizations/errors/organization-not-found.error.js';
import type { InvitationExpiredError } from '../errors/invitation-expired.error.js';
import type { InvitationNotFoundError } from '../errors/invitation-not-found.error.js';
import type { AcceptInvitationResponse } from '../responses/accept-invitation.response.js';
import type { InvitationResponse } from '../responses/invitation.response.js';

export type InvitationError =
  | OrganizationNotFoundError
  | InvitationNotFoundError
  | InvitationExpiredError
  | AlreadyMemberError
  | EmailAlreadyExistsError
  | UsernameAlreadyExistsError
  | ValidationError
  | InfrastructureError;

export type InvitationResult = Result<InvitationResponse, InvitationError>;

export type InvitationListResult = Result<InvitationResponse[], InvitationError>;

export type RevokeInvitationResult = Result<{ message: string }, InvitationError>;

export type AcceptInvitationResult = Result<AcceptInvitationResponse, InvitationError>;
