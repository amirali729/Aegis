import type { Schema, Document } from 'mongoose';
import mongoose from 'mongoose';

/**
 * Permission keys follow a "resource:action" convention, e.g. "user:view",
 * "role:create". See docs/Authorization Architecture.md section 8-9.
 */
export interface IPermission extends Document {
  key: string;
  description?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const permissionSchema: Schema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9_]+:[a-z0-9_]+$/,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);
