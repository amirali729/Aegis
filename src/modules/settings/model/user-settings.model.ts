import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export type ThemePreference = 'light' | 'dark' | 'system';
export type DensityPreference = 'comfortable' | 'compact';
export type ProfileVisibility = 'public' | 'organization' | 'private';

export interface IGeneralPreferences {
  timezone: string;
  locale: string;
  dateFormat: string;
  /** The organization the frontend should select by default on login. */
  defaultOrganizationId?: Types.ObjectId;
}

export interface IAppearancePreferences {
  theme: ThemePreference;
  density: DensityPreference;
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
}

export interface INotificationPreferences {
  emailEnabled: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  pushEnabled: boolean;
}

export interface IPrivacyPreferences {
  profileVisibility: ProfileVisibility;
  showEmail: boolean;
  showActivity: boolean;
  allowIndexing: boolean;
}

export interface IDeveloperPreferences {
  apiAccessEnabled: boolean;
  betaFeaturesEnabled: boolean;
  showDeveloperTools: boolean;
}

export interface IUserPreferences {
  general: IGeneralPreferences;
  appearance: IAppearancePreferences;
  notifications: INotificationPreferences;
  privacy: IPrivacyPreferences;
  developer: IDeveloperPreferences;
}

export interface IConnectedApp {
  _id: Types.ObjectId;
  /** e.g. "google", "github" - the OAuth provider this connection came from. */
  provider: string;
  providerAccountId: string;
  scopes: string[];
  connectedAt: Date;
}

export interface IUserSettings extends Document {
  userId: Types.ObjectId;
  bio?: string;
  avatarUrl?: string;
  jobTitle?: string;
  company?: string;
  website?: string;
  location?: string;
  preferences: IUserPreferences;
  connectedApps: IConnectedApp[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const generalPreferencesSchema = new Schema<IGeneralPreferences>(
  {
    timezone: { type: String, default: 'UTC' },
    locale: { type: String, default: 'en-US' },
    dateFormat: { type: String, default: 'YYYY-MM-DD' },
    defaultOrganizationId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  },
  { _id: false },
);

const appearancePreferencesSchema = new Schema<IAppearancePreferences>(
  {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    density: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    reduceMotion: { type: Boolean, default: false },
  },
  { _id: false },
);

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    emailEnabled: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: true },
    pushEnabled: { type: Boolean, default: false },
  },
  { _id: false },
);

const privacyPreferencesSchema = new Schema<IPrivacyPreferences>(
  {
    profileVisibility: {
      type: String,
      enum: ['public', 'organization', 'private'],
      default: 'organization',
    },
    showEmail: { type: Boolean, default: false },
    showActivity: { type: Boolean, default: true },
    allowIndexing: { type: Boolean, default: false },
  },
  { _id: false },
);

const developerPreferencesSchema = new Schema<IDeveloperPreferences>(
  {
    apiAccessEnabled: { type: Boolean, default: false },
    betaFeaturesEnabled: { type: Boolean, default: false },
    showDeveloperTools: { type: Boolean, default: false },
  },
  { _id: false },
);

const connectedAppSchema = new Schema<IConnectedApp>(
  {
    provider: { type: String, required: true, trim: true, lowercase: true },
    providerAccountId: { type: String, required: true },
    scopes: { type: [String], default: [] },
    connectedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const userSettingsSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    bio: { type: String, trim: true, maxlength: 500 },
    avatarUrl: { type: String, trim: true },
    jobTitle: { type: String, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 100 },
    website: { type: String, trim: true, maxlength: 200 },
    location: { type: String, trim: true, maxlength: 100 },
    preferences: {
      type: {
        general: { type: generalPreferencesSchema, default: () => ({}) },
        appearance: { type: appearancePreferencesSchema, default: () => ({}) },
        notifications: { type: notificationPreferencesSchema, default: () => ({}) },
        privacy: { type: privacyPreferencesSchema, default: () => ({}) },
        developer: { type: developerPreferencesSchema, default: () => ({}) },
      },
      default: () => ({}),
      _id: false,
    },
    connectedApps: { type: [connectedAppSchema], default: [] },
  },
  { timestamps: true },
);

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);
