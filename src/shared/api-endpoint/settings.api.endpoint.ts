const SettingsApiEndpoint = {
  PROFILE: '/settings/profile',
  PREFERENCES: '/settings/preferences',
  CONNECTED_APPS: '/settings/connected-apps',
  DISCONNECT_APP: '/settings/connected-apps/:provider',
  DEACTIVATE: '/settings/deactivate',
  REACTIVATE: '/settings/reactivate',
  DELETE_ACCOUNT: '/settings/account',
};

export const {
  PROFILE: SETTINGS_PROFILE,
  PREFERENCES: SETTINGS_PREFERENCES,
  CONNECTED_APPS: SETTINGS_CONNECTED_APPS,
  DISCONNECT_APP: SETTINGS_DISCONNECT_APP,
  DEACTIVATE: SETTINGS_DEACTIVATE,
  REACTIVATE: SETTINGS_REACTIVATE,
  DELETE_ACCOUNT: SETTINGS_DELETE_ACCOUNT,
} = SettingsApiEndpoint;
