import type { IUser } from '../../auth/model/user.model.js';
import type { IUserSettings } from '../model/user-settings.model.js';
import { ConnectedAppResponse } from '../responses/connected-app-response.js';
import { PreferencesResponse } from '../responses/preferences-response.js';
import { ProfileResponse } from '../responses/profile-response.js';

export function toProfileResponse(user: IUser, settings: IUserSettings): ProfileResponse {
  return new ProfileResponse(
    user._id.toString(),
    user.username,
    user.email,
    user.fullName,
    settings.bio,
    settings.avatarUrl,
    settings.jobTitle,
    settings.company,
    settings.website,
    settings.location,
    settings.updatedAt,
  );
}

export function toPreferencesResponse(settings: IUserSettings): PreferencesResponse {
  return new PreferencesResponse(
    settings.preferences.general,
    settings.preferences.appearance,
    settings.preferences.notifications,
    settings.preferences.privacy,
    settings.preferences.developer,
  );
}

export function toConnectedAppResponses(settings: IUserSettings): ConnectedAppResponse[] {
  return settings.connectedApps.map(
    (app) =>
      new ConnectedAppResponse(
        app._id.toString(),
        app.provider,
        app.providerAccountId,
        app.scopes,
        app.connectedAt,
      ),
  );
}
