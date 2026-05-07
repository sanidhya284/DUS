import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  isActive: boolean;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>('User', userSchema);
