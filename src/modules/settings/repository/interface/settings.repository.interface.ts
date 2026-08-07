import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { UpdatePreferencesDto } from '../../dto/update-preferences.dto.js';
import type { UpdateProfileDto } from '../../dto/update-profile.dto.js';
import type { IUserSettings } from '../../model/user-settings.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface ISettingsRepository {
  findByUserId(userId: string): Promise<DataResult<IUserSettings | null>>;

  /** Get-or-create: returns the user's settings doc, creating one with defaults if it doesn't exist yet. */
  getOrCreate(userId: string): Promise<DataResult<IUserSettings>>;

  updateProfile(userId: string, dto: UpdateProfileDto): Promise<DataResult<IUserSettings>>;

  /** Deep-merges only the preference sections present in `dto`; omitted sections/fields are left untouched. */
  updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<DataResult<IUserSettings>>;

  addConnectedApp(
    userId: string,
    data: { provider: string; providerAccountId: string; scopes: string[] },
  ): Promise<DataResult<IUserSettings>>;

  removeConnectedApp(userId: string, provider: string): Promise<DataResult<IUserSettings>>;

  deleteByUserId(userId: string): Promise<DataResult<boolean>>;
}
