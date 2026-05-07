import { Types } from 'mongoose';

export interface ShortenUrlInput {
  originalUrl: string;
  alias?: string;
  expiresAt?: Date;
  userId?: Types.ObjectId;
}

export interface UrlResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  customAlias: boolean;
  expiresAt?: Date;
  clickCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface RedirectResult {
  originalUrl: string;
  shortCode: string;
}

export interface UrlListQuery {
  userId: Types.ObjectId;
  page?: number;
  limit?: number;
}
