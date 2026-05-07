import { Schema, model, Document, Types } from 'mongoose';

export interface IUrl extends Document {
  shortCode: string;
  customAlias: boolean;
  originalUrl: string;
  userId?: Types.ObjectId;
  createdAt: Date;
  expiresAt?: Date;
  clickCount: number;
  isActive: boolean;
}

const urlSchema = new Schema<IUrl>(
  {
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,  // case-insensitive: stored & queried in lowercase
      maxlength: 32,
    },
    customAlias: { type: Boolean, default: false },
    originalUrl: { type: String, required: true, maxlength: 2048 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, sparse: true },
    expiresAt: { type: Date, sparse: true },
    clickCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// TTL index — MongoDB auto-purges documents when expiresAt is reached
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

// Compound index for dashboard query: user's active URLs sorted by creation
urlSchema.index({ userId: 1, createdAt: -1 });

export const UrlModel = model<IUrl>('Url', urlSchema);
