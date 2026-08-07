import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { NotFoundError } from '../../../shared/errors/not-found.error.js';
import type { UnauthorizedError } from '../../../shared/errors/unauthorized.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { ConnectedAppResponse } from '../responses/connected-app-response.js';
import type { PreferencesResponse } from '../responses/preferences-response.js';
import type { ProfileResponse } from '../responses/profile-response.js';

export type SettingsError =
  ValidationError | NotFoundError | UnauthorizedError | InfrastructureError;

export type ProfileResult = Result<ProfileResponse, SettingsError>;

export type PreferencesResult = Result<PreferencesResponse, SettingsError>;

export type ConnectedAppListResult = Result<ConnectedAppResponse[], SettingsError>;

export type SettingsMessageResult = Result<{ message: string }, SettingsError>;
