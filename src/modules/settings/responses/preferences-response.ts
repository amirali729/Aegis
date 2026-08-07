import type {
  IAppearancePreferences,
  IDeveloperPreferences,
  IGeneralPreferences,
  INotificationPreferences,
  IPrivacyPreferences,
} from '../model/user-settings.model.js';

export class PreferencesResponse {
  constructor(
    public readonly general: IGeneralPreferences,
    public readonly appearance: IAppearancePreferences,
    public readonly notifications: INotificationPreferences,
    public readonly privacy: IPrivacyPreferences,
    public readonly developer: IDeveloperPreferences,
  ) {}
}
