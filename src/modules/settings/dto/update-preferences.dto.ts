import type {
  IAppearancePreferences,
  IDeveloperPreferences,
  IGeneralPreferences,
  INotificationPreferences,
  IPrivacyPreferences,
} from '../model/user-settings.model.js';

export class UpdatePreferencesDto {
  constructor(
    public readonly general?: Partial<IGeneralPreferences>,
    public readonly appearance?: Partial<IAppearancePreferences>,
    public readonly notifications?: Partial<INotificationPreferences>,
    public readonly privacy?: Partial<IPrivacyPreferences>,
    public readonly developer?: Partial<IDeveloperPreferences>,
  ) {}
}
