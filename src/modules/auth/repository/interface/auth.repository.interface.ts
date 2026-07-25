import type { SignUpDto } from '../../dto/signup.dto.js';
import type { IUser } from '../../models/user.model.js';
import type { Result } from '../../../../shared/result/result.js';
import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';

export type DataResult<T> = Result<T, InfrastructureError>;

/**
 * Pure data-access contract for the auth module.
 *
 * IMPORTANT: this interface intentionally contains NO business rules
 * (no "email already exists" checks, no password comparisons, no
 * token orchestration). Those decisions belong to IAuthService.
 *
 * The repository only ever fails with InfrastructureError — "the
 * database could not be reached" — never with a domain/business error.
 */
export interface IAuthRepository {
  findByEmail(email: string): Promise<DataResult<IUser | null>>;

  findByUsername(username: string): Promise<DataResult<IUser | null>>;

  findByEmailOrUsername(email: string, username: string): Promise<DataResult<IUser | null>>;

  findById(userId: string): Promise<DataResult<IUser | null>>;

  findByEmailVerificationTokenHash(tokenHash: string): Promise<DataResult<IUser | null>>;

  findByPasswordResetTokenHash(tokenHash: string): Promise<DataResult<IUser | null>>;

  createUser(dto: SignUpDto): Promise<DataResult<IUser>>;

  /**
   * Persists whatever mutations the caller has already made on the
   * given user document (e.g. new password, new refresh token, new
   * verification token) and returns the saved document.
   */
  save(user: IUser, options?: { validateBeforeSave?: boolean }): Promise<DataResult<IUser>>;
}
