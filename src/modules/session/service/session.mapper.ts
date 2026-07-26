import type { ISession } from '../model/session.model.js';
import { SessionResponse } from '../responses/session.response.js';

export function toSessionResponse(session: ISession, isCurrent: boolean): SessionResponse {
  return new SessionResponse(
    session._id.toString(),
    session.deviceName,
    session.userAgent,
    session.ipAddress,
    session.lastActiveAt,
    session.createdAt,
    isCurrent,
  );
}
