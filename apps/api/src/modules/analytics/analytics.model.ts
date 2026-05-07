import { Schema, model, Document, Types } from 'mongoose';

export interface IClick extends Document {
  shortCode: string;
  timestamp: Date;
  ipHash: string;
  userAgent: string;
  referrer: string;
  country: string;
}

const clickSchema = new Schema<IClick>(
  {
    shortCode: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, default: Date.now },
    ipHash: { type: String, required: true },
    userAgent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    country: { type: String, default: 'Unknown', index: true },
  },
  { _id: true, timestamps: false }
);

// Compound index: primary analytics query pattern
clickSchema.index({ shortCode: 1, timestamp: -1 });

// Time-series queries across all codes
clickSchema.index({ timestamp: -1 });

export const ClickModel = model<IClick>('Click', clickSchema);
