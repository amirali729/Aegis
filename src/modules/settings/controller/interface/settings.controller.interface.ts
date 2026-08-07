import type { NextFunction, Request, Response } from 'express';
import type {
  ConnectedAppListResult,
  PreferencesResult,
  ProfileResult,
  SettingsMessageResult,
} from '../../types/settings.types.js';

export interface ISettingsController {
  getProfile(req: Request, res: Response, next: NextFunction): Promise<ProfileResult>;

  updateProfile(req: Request, res: Response, next: NextFunction): Promise<ProfileResult>;

  getPreferences(req: Request, res: Response, next: NextFunction): Promise<PreferencesResult>;

  updatePreferences(req: Request, res: Response, next: NextFunction): Promise<PreferencesResult>;

  listConnectedApps(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<ConnectedAppListResult>;

  disconnectApp(req: Request, res: Response, next: NextFunction): Promise<ConnectedAppListResult>;

  deactivateAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<SettingsMessageResult>;

  reactivateAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<SettingsMessageResult>;

  deleteAccount(req: Request, res: Response, next: NextFunction): Promise<SettingsMessageResult>;
}
