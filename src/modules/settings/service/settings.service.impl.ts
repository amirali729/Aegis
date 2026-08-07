import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { NotFoundError } from '../../../shared/errors/not-found.error.js';
import { UnauthorizedError } from '../../../shared/errors/unauthorized.error.js';
import { err, ok } from '../../../shared/result/result.js';

import type { IAuthRepository } from '../../auth/repository/interface/auth.repository.interface.js';
import type { IAuditLogger } from '../../audit/service/interface/audit-logger.interface.js';
import { RecordAuditEventDto } from '../../audit/dto/record-audit-event.dto.js';
import type { IMembershipRepository } from '../../membership/repository/interface/membership.repository.interface.js';
import type { ISessionService } from '../../session/service/interface/session.service.interface.js';

import type { UpdatePreferencesDto } from '../dto/update-preferences.dto.js';
import type { UpdateProfileDto } from '../dto/update-profile.dto.js';
import type { ISettingsRepository } from '../repository/interface/settings.repository.interface.js';
import {
  toConnectedAppResponses,
  toPreferencesResponse,
  toProfileResponse,
} from './settings-mapper.js';
import type { ISettingsService } from './interface/settings.service.interface.js';

import type {
  ConnectedAppListResult,
  PreferencesResult,
  ProfileResult,
  SettingsMessageResult,
} from '../types/settings.types.js';

export class SettingsService implements ISettingsService {
  constructor(
    private readonly repository: ISettingsRepository,
    private readonly authRepository: IAuthRepository,
    private readonly sessionService: ISessionService,
    private readonly membershipRepository: IMembershipRepository,
    private readonly auditLogger?: IAuditLogger,
  ) {}

  async getProfile(userId: string): Promise<ProfileResult> {
    const user = await this.authRepository.findById(userId);
    if (!user.ok) return err(user.error);
    if (!user.value) return err(new NotFoundError('User not found.'));

    const settings = await this.repository.getOrCreate(userId);
    if (!settings.ok) return err(settings.error);

    return ok(toProfileResponse(user.value, settings.value));
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResult> {
    const user = await this.authRepository.findById(userId);
    if (!user.ok) return err(user.error);
    if (!user.value) return err(new NotFoundError('User not found.'));

    const settings = await this.repository.updateProfile(userId, dto);
    if (!settings.ok) return err(settings.error);

    void this.auditLogger?.record(
      new RecordAuditEventDto('settings.profile_updated', true, userId, 'user', 'user', userId),
    );

    return ok(toProfileResponse(user.value, settings.value));
  }

  async getPreferences(userId: string): Promise<PreferencesResult> {
    const settings = await this.repository.getOrCreate(userId);
    if (!settings.ok) return err(settings.error);

    return ok(toPreferencesResponse(settings.value));
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<PreferencesResult> {
    const settings = await this.repository.updatePreferences(userId, dto);
    if (!settings.ok) return err(settings.error);

    void this.auditLogger?.record(
      new RecordAuditEventDto('settings.preferences_updated', true, userId, 'user', 'user', userId),
    );

    return ok(toPreferencesResponse(settings.value));
  }

  async listConnectedApps(userId: string): Promise<ConnectedAppListResult> {
    const settings = await this.repository.getOrCreate(userId);
    if (!settings.ok) return err(settings.error);

    return ok(toConnectedAppResponses(settings.value));
  }

  async disconnectApp(userId: string, provider: string): Promise<ConnectedAppListResult> {
    const settings = await this.repository.removeConnectedApp(userId, provider);
    if (!settings.ok) return err(settings.error);

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'settings.app_disconnected',
        true,
        userId,
        'user',
        'user',
        userId,
        undefined,
        undefined,
        { provider },
      ),
    );

    return ok(toConnectedAppResponses(settings.value));
  }

  async deactivateAccount(userId: string): Promise<SettingsMessageResult> {
    const user = await this.authRepository.findById(userId);
    if (!user.ok) return err(user.error);
    if (!user.value) return err(new NotFoundError('User not found.'));

    user.value.status = 'deactivated';
    user.value.deactivatedAt = new Date();

    const saved = await this.authRepository.save(user.value, { validateBeforeSave: false });
    if (!saved.ok) return err(saved.error);

    // Deactivating logs the account out everywhere - reactivating (see
    // below) does NOT restore old sessions, the user simply logs back in.
    const revoked = await this.sessionService.revokeAllForUser(userId);
    if (!revoked.ok) {
      return err(new InfrastructureError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto('settings.account_deactivated', true, userId, 'user', 'user', userId),
    );

    return ok({ message: 'Your account has been deactivated.' });
  }

  async reactivateAccount(userId: string): Promise<SettingsMessageResult> {
    const user = await this.authRepository.findById(userId);
    if (!user.ok) return err(user.error);
    if (!user.value) return err(new NotFoundError('User not found.'));

    user.value.status = 'active';
    user.value.deactivatedAt = undefined;

    const saved = await this.authRepository.save(user.value, { validateBeforeSave: false });
    if (!saved.ok) return err(saved.error);

    void this.auditLogger?.record(
      new RecordAuditEventDto('settings.account_reactivated', true, userId, 'user', 'user', userId),
    );

    return ok({ message: 'Your account has been reactivated.' });
  }

  async deleteAccount(userId: string, password: string): Promise<SettingsMessageResult> {
    const user = await this.authRepository.findById(userId);
    if (!user.ok) return err(user.error);
    if (!user.value) return err(new NotFoundError('User not found.'));

    const isPasswordCorrect = await user.value.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      return err(new UnauthorizedError('Incorrect password.'));
    }

    // Best-effort cleanup around the irreversible User deletion below:
    // revoke every session and drop every organization membership so a
    // deleted account doesn't linger as a phantom "member" elsewhere.
    // Neither is allowed to block the deletion itself - a failure here
    // is logged by the underlying service/repository and should not
    // stop the user from being able to delete their account.
    await this.sessionService.revokeAllForUser(userId);
    await this.membershipRepository.deleteAllForUser(userId);
    await this.repository.deleteByUserId(userId);

    const deleted = await this.authRepository.deleteById(userId);
    if (!deleted.ok) return err(deleted.error);
    if (!deleted.value) return err(new NotFoundError('User not found.'));

    void this.auditLogger?.record(
      new RecordAuditEventDto('settings.account_deleted', true, userId, 'user', 'user', userId),
    );

    return ok({ message: 'Your account has been permanently deleted.' });
  }
}
