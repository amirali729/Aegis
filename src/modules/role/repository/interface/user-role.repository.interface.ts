import type { Result } from '../../../../shared/result/result.js';
import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IUserRoleRepository {
  findUserRoleIds(userId: string): Promise<DataResult<string[] | null>>;

  addRole(userId: string, roleId: string): Promise<DataResult<string[] | null>>;

  removeRole(userId: string, roleId: string): Promise<DataResult<string[] | null>>;
}
