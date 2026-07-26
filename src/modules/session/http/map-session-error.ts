import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { SessionError } from '../types/session.types.js';

const errorMap: Record<SessionError['kind'], (error: SessionError) => BaseErrorResponse> = {
  session_not_found: (error) => new BaseErrorResponse(error.message, 404),

  invalid_refresh_token: (error) => new BaseErrorResponse(error.message, 401),

  session_expired: (error) => new BaseErrorResponse(error.message, 401),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapSessionError(error: SessionError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
