import type { UpdatePreferencesDto } from '../../dto/update-preferences.dto.js';
import type { UpdateProfileDto } from '../../dto/update-profile.dto.js';
import type {
  ConnectedAppListResult,
  PreferencesResult,
  ProfileResult,
  SettingsMessageResult,
} from '../../types/settings.types.js';

export interface ISettingsService {
  getProfile(userId: string): Promise<ProfileResult>;

  updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResult>;

  getPreferences(userId: string): Promise<PreferencesResult>;

  updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<PreferencesResult>;

  listConnectedApps(userId: string): Promise<ConnectedAppListResult>;

  disconnectApp(userId: string, provider: string): Promise<ConnectedAppListResult>;

  deactivateAccount(userId: string): Promise<SettingsMessageResult>;

  reactivateAccount(userId: string): Promise<SettingsMessageResult>;

  deleteAccount(userId: string, password: string): Promise<SettingsMessageResult>;
}
