import type { Document, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: Types.ObjectId[];
  /**
   * System roles (seeded by the platform, e.g. "Admin") can't be
   * deleted or renamed through the API - only their permission set
   * can be adjusted. Prevents an operator from accidentally locking
   * themselves out of their own instance.
   */
  isSystem: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const roleSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Permission',
        },
      ],
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Role = mongoose.model<IRole>('Role', roleSchema);
