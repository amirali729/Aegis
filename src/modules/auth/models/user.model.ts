import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { hashToken } from '../../../shared/security/hashing/token-hash.js';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  /**
   * References to Role documents (modules/role). Kept as a plain
   * ObjectId array (not populated by default) so authorization checks
   * can decide when to look up fresh permissions vs. rely on a cache.
   * See shared/security/authorization for permission evaluation.
   */
  roles: mongoose.Types.ObjectId[];
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  refreshToken?: string;
  tokenVersion: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
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
    },
    fullName: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    roles: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Role',
        },
      ],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpiry: Date,
    passwordResetToken: String,
    passwordResetExpiry: Date,
  },
  { timestamps: true },
);

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

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_REFRESH_SECRET as jwt.Secret,
    {
      expiresIn: process.env.ACCESS_REFRESH_EXPIRY as SignOptions['expiresIn'],
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

userSchema.methods.createPasswordResetToken = function (): string {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = hashToken(rawToken);
  this.passwordResetExpiry = new Date(
    Date.now() + 60 * 60 * 1000, // 1h
  );

  return rawToken;
};

export const User = mongoose.model<IUser>('User', userSchema);
