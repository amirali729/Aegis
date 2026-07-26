import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { SessionNotFoundError } from '../errors/session-not-found.error.js';
import type { InvalidRefreshTokenError } from '../errors/invalid-refresh-token.error.js';
import type { SessionExpiredError } from '../errors/session-expired.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { SessionResponse } from '../responses/session.response.js';

export type SessionError =
  SessionNotFoundError | InvalidRefreshTokenError | SessionExpiredError | InfrastructureError;

export type SessionListResult = Result<SessionResponse[], SessionError>;

export type RevokeSessionResult = Result<{ message: string }, SessionError>;

export interface RotatedSession {
  userId: string;
  rawRefreshToken: string;
}

export type RotateSessionResult = Result<RotatedSession, SessionError>;

export interface CreatedSession {
  rawRefreshToken: string;
  session: SessionResponse;
}

export type CreateSessionResult = Result<CreatedSession, SessionError>;
