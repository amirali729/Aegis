import type { Document, Schema, Types } from 'mongoose';
import mongoose from 'mongoose';

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface IInvitation extends Document {
  organizationId: Types.ObjectId;
  email: string;
  /** SHA-256 hash of the raw invite token - the raw token is only ever sent via email. */
  tokenHash: string;
  status: InvitationStatus;
  invitedBy?: Types.ObjectId;
  expiresAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const invitationSchema: Schema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      // Mongoose model is registered as "Tenant" (see
      // organizations/model/organization.model.ts) even though the
      // module/type layer calls it Organization - ref must match the
      // registered model name or populate('organizationId') throws
      // MissingSchemaError.
      ref: 'Tenant',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'revoked', 'expired'],
      default: 'pending',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export const Invitation = mongoose.model<IInvitation>('Invitation', invitationSchema);
