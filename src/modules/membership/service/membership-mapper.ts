import type { IUser } from '../../auth/model/user.model.js';
import type { IMembership } from '../model/membership.model.js';
import { MemberResponse } from '../responses/member.response.js';

export function toMemberResponse(membership: IMembership): MemberResponse {
  // `userId` is populated by the repository (findByOrganization), so at
  // runtime this is an IUser doc even though the static type is
  // ObjectId.
  const user = membership.userId as unknown as IUser;

  return new MemberResponse(
    user._id.toString(),
    user.username,
    user.email,
    membership.status,
    membership.joinedAt,
  );
}
