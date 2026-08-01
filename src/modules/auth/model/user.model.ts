import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import type { PlatformRole } from '../../../shared/security/authorization/platform-roles.js';
import { PLATFORM_ROLES } from '../../../shared/security/authorization/platform-roles.js';
import { hashToken } from '../../../shared/security/hashing/token-hash.js';

export interface IUser extends Document {
  /** Null in single-tenant self-hosted deployments (MULTI_TENANT=false). */
  tenantId?: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  fullName?: string;
  /**
   * Fixed platform-level role (see shared/security/authorization/
   * platform-roles.ts for the capability map). This is intentionally
   * NOT a reference to a Role document - the platform layer is a small,
   * fixed set defined by the architecture (Owner/Admin/Support/User),
   * unlike organization roles which are custom, per-org Role documents.
   * Everyone is 'user' by default; 'owner' is never granted through
   * signup (see bootstrap/assign-admin.ts).
   *
   * Organization-level roles are NOT stored here - see
   * modules/membership/model/membership.model.ts (roleIds). Roles never
   * attach directly to a User; Membership is the permission boundary.
   */
  platformRole: PlatformRole;
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  /**
   * Account-level brute-force protection, independent of the IP-based
   * rate limiter (see shared/security/middleware/rate-limit.middleware).
   * Tracks consecutive failed logins for THIS account regardless of
   * which IP they came from, so credential-stuffing spread across
   * rotating IPs still gets locked out.
   */
  failedLoginAttempts: number;
  lockUntil?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  /** True while the account is locked out from failed-login attempts. */
  isLocked(): boolean;
  /**
   * Records a failed login attempt and locks the account once the
   * threshold is reached. Persists the change itself (caller does not
   * need to call save()).
   */
  registerFailedLogin(): Promise<void>;
  /**
   * Clears any failed-attempt count / lock on a successful login.
   * Persists the change itself (caller does not need to call save()).
   */
  registerSuccessfulLogin(): Promise<void>;
  /**
   * Generates a raw (unhashed) email verification token, persists only
   * its hash + expiry on the document, and returns the raw token so the
   * caller can email it. Caller is still responsible for save().
   */
  createEmailVerificationToken(): string;
  /**
   * Generates a raw (unhashed) password reset token, persists only its
   * hash + expiry on the document, and returns the raw token. Caller is
   * still responsible for save().
   */
  createPasswordResetToken(): string;
}
const userSchema: Schema = new mongoose.Schema(
  {
    // Note: username/email remain globally unique rather than
    // tenant-scoped for now - narrowing that to per-tenant uniqueness
    // is a data migration (existing unique indexes would need to be
    // dropped/recreated) and is left as a deliberate follow-up. tenantId
    // itself is populated and used to scope lookups wherever it's safe
    // to do so (see auth.repository.impl.ts).
    // Field kept as "tenantId" (pre-dates the Organization rename) but
    // points at the Organization collection - Organization IS the tenant.
    tenantId: {
      type: Schema.Types.ObjectId,
      // Mongoose model is registered as "Tenant" (see
      // organizations/model/organization.model.ts) even though the
      // module/type layer calls it Organization - ref must match the
      // registered model name or populate('tenantId') throws
      // MissingSchemaError.
      ref: 'Tenant',
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'please provide the email too'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'password is required please enter your password'],
      // Never returned by default - callers that genuinely need it
      // (login, change-password) opt in explicitly with
      // .select('+password'). Without this, every authenticated
      // request loaded the password hash into memory for no reason
      // (see verifyJwt.middleware.ts), which is unnecessary exposure.
      select: false,
    },
    fullName: {
      type: String,
      trim: true,
    },
    platformRole: {
      type: String,
      enum: PLATFORM_ROLES,
      default: 'user',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: { type: String, index: true, sparse: true },
    emailVerificationExpiry: Date,
    passwordResetToken: { type: String, index: true, sparse: true },
    passwordResetExpiry: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  { timestamps: true },
);

/** Failed login attempts allowed before the account is locked out. */
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
/** How long an account stays locked once the threshold is hit. */
const ACCOUNT_LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'],
    },
  );
};

userSchema.methods.createEmailVerificationToken = function (): string {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = hashToken(rawToken);
  this.emailVerificationExpiry = new Date(
    Date.now() + 24 * 60 * 60 * 1000, // 24h
  );

  return rawToken;
};

userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

userSchema.methods.registerFailedLogin = async function (): Promise<void> {
  // A previous lock has already expired - start counting fresh instead
  // of instantly re-locking on the very next bad attempt.
  if (this.lockUntil && this.lockUntil.getTime() <= Date.now()) {
    this.failedLoginAttempts = 0;
    this.lockUntil = undefined;
  }

  this.failedLoginAttempts = (this.failedLoginAttempts ?? 0) + 1;

  if (this.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + ACCOUNT_LOCK_DURATION_MS);
  }

  await this.save({ validateBeforeSave: false });
};

userSchema.methods.registerSuccessfulLogin = async function (): Promise<void> {
  if (!this.failedLoginAttempts && !this.lockUntil) return;

  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;

  await this.save({ validateBeforeSave: false });
};

userSchema.methods.createPasswordResetToken = function (): string {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = hashToken(rawToken);
  this.passwordResetExpiry = new Date(
    Date.now() + 60 * 60 * 1000, // 1h
  );

  return rawToken;
};

export const User = mongoose.model<IUser>('User', userSchema);
