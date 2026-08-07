import type { NextFunction, Request, Response } from 'express';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto.js';
import { UpdateProfileDto } from '../dto/update-profile.dto.js';
import type { ISettingsService } from '../service/interface/settings.service.interface.js';
import type {
  ConnectedAppListResult,
  PreferencesResult,
  ProfileResult,
  SettingsMessageResult,
} from '../types/settings.types.js';
import type { ISettingsController } from './interface/settings.controller.interface.js';

import { clearAuthCookies } from '../../../shared/http/cookies.js';

export class SettingsController implements ISettingsController {
  constructor(private readonly service: ISettingsService) {}

  async getProfile(req: Request, _res: Response, _next: NextFunction): Promise<ProfileResult> {
    return this.service.getProfile(req.user._id.toString());
  }

  async updateProfile(req: Request, _res: Response, _next: NextFunction): Promise<ProfileResult> {
    const dto = new UpdateProfileDto(
      req.body.bio,
      req.body.avatarUrl,
      req.body.jobTitle,
      req.body.company,
      req.body.website,
      req.body.location,
    );

    return this.service.updateProfile(req.user._id.toString(), dto);
  }

  async getPreferences(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<PreferencesResult> {
    return this.service.getPreferences(req.user._id.toString());
  }

  async updatePreferences(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<PreferencesResult> {
    const dto = new UpdatePreferencesDto(
      req.body.general,
      req.body.appearance,
      req.body.notifications,
      req.body.privacy,
      req.body.developer,
    );

    return this.service.updatePreferences(req.user._id.toString(), dto);
  }

  async listConnectedApps(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<ConnectedAppListResult> {
    return this.service.listConnectedApps(req.user._id.toString());
  }

  async disconnectApp(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<ConnectedAppListResult> {
    return this.service.disconnectApp(req.user._id.toString(), req.params.provider as string);
  }

  async deactivateAccount(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<SettingsMessageResult> {
    const result = await this.service.deactivateAccount(req.user._id.toString());

    if (result.ok) {
      // Deactivation revokes every session server-side - clear the
      // cookies on this response too so the browser doesn't keep
      // sending a now-worthless refresh token.
      clearAuthCookies(res);
    }

    return result;
  }

  async reactivateAccount(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<SettingsMessageResult> {
    return this.service.reactivateAccount(req.user._id.toString());
  }

  async deleteAccount(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<SettingsMessageResult> {
    const result = await this.service.deleteAccount(req.user._id.toString(), req.body.password);

    if (result.ok) {
      clearAuthCookies(res);
    }

    return result;
  }
}
