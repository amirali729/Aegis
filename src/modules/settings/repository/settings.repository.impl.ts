import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { UpdatePreferencesDto } from '../dto/update-preferences.dto.js';
import type { UpdateProfileDto } from '../dto/update-profile.dto.js';
import type { IUserSettings } from '../model/user-settings.model.js';
import { UserSettings } from '../model/user-settings.model.js';
import type { DataResult, ISettingsRepository } from './interface/settings.repository.interface.js';

/**
 * Flattens the (optional) sub-objects of an UpdatePreferencesDto into
 * dotted `$set` paths, e.g. { general: { timezone: 'UTC' } } becomes
 * { 'preferences.general.timezone': 'UTC' }. Only fields actually
 * present in the dto are touched - this is what makes
 * updatePreferences() a deep-merge instead of overwriting an entire
 * section with a partial object.
 */
function toDottedPreferenceUpdate(dto: UpdatePreferencesDto): Record<string, unknown> {
  const sections = ['general', 'appearance', 'notifications', 'privacy', 'developer'] as const;
  const update: Record<string, unknown> = {};

  for (const section of sections) {
    const value = dto[section];
    if (!value) continue;

    for (const [key, val] of Object.entries(value)) {
      if (val === undefined) continue;
      update[`preferences.${section}.${key}`] = val;
    }
  }

  return update;
}

export class SettingsRepository implements ISettingsRepository {
  async findByUserId(userId: string): Promise<DataResult<IUserSettings | null>> {
    try {
      const settings = await UserSettings.findOne({ userId });
      return ok(settings);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async getOrCreate(userId: string): Promise<DataResult<IUserSettings>> {
    try {
      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        { $setOnInsert: { userId } },
        { new: true, upsert: true },
      );
      return ok(settings);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<DataResult<IUserSettings>> {
    try {
      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        {
          $setOnInsert: { userId },
          $set: {
            ...(dto.bio !== undefined && { bio: dto.bio }),
            ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
            ...(dto.jobTitle !== undefined && { jobTitle: dto.jobTitle }),
            ...(dto.company !== undefined && { company: dto.company }),
            ...(dto.website !== undefined && { website: dto.website }),
            ...(dto.location !== undefined && { location: dto.location }),
          },
        },
        { new: true, upsert: true },
      );
      return ok(settings);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<DataResult<IUserSettings>> {
    try {
      const dottedUpdate = toDottedPreferenceUpdate(dto);

      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        {
          $setOnInsert: { userId },
          ...(Object.keys(dottedUpdate).length > 0 && { $set: dottedUpdate }),
        },
        { new: true, upsert: true },
      );
      return ok(settings);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async addConnectedApp(
    userId: string,
    data: { provider: string; providerAccountId: string; scopes: string[] },
  ): Promise<DataResult<IUserSettings>> {
    try {
      // Replaces any existing connection for the same provider rather
      // than accumulating duplicates - a user can only have one active
      // connection per OAuth provider at a time.
      await UserSettings.findOneAndUpdate(
        { userId },
        { $setOnInsert: { userId }, $pull: { connectedApps: { provider: data.provider } } },
        { upsert: true },
      );

      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        {
          $push: {
            connectedApps: {
              provider: data.provider,
              providerAccountId: data.providerAccountId,
              scopes: data.scopes,
              connectedAt: new Date(),
            },
          },
        },
        { new: true, upsert: true },
      );
      return ok(settings);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async removeConnectedApp(userId: string, provider: string): Promise<DataResult<IUserSettings>> {
    try {
      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        { $setOnInsert: { userId }, $pull: { connectedApps: { provider } } },
        { new: true, upsert: true },
      );
      return ok(settings);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async deleteByUserId(userId: string): Promise<DataResult<boolean>> {
    try {
      const result = await UserSettings.findOneAndDelete({ userId });
      return ok(!!result);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
