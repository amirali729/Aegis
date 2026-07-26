import type { Types } from 'mongoose';
import { Schema, model, type Document } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  deviceName: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  lastActiveAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    deviceName: {
      type: String,
      required: true,
      trim: true,
    },

    userAgent: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Automatically delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model<ISession>('Session', sessionSchema);
