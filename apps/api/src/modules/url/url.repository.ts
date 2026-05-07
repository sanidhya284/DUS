import { Types } from 'mongoose';
import { UrlModel, IUrl } from './url.model';

export class UrlRepository {
  async findByShortCode(shortCode: string): Promise<IUrl | null> {
    return UrlModel.findOne({ shortCode, isActive: true });
  }

  async findById(id: Types.ObjectId, userId: Types.ObjectId): Promise<IUrl | null> {
    return UrlModel.findOne({ _id: id, userId });
  }

  async findByOriginalUrlAndUser(originalUrl: string, userId: Types.ObjectId): Promise<IUrl | null> {
    return UrlModel.findOne({ originalUrl, userId, isActive: true });
  }

  async findByUserId(
    userId: Types.ObjectId,
    page: number,
    limit: number
  ): Promise<{ urls: IUrl[]; total: number }> {
    const [urls, total] = await Promise.all([
      UrlModel.find({ userId, isActive: true })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      UrlModel.countDocuments({ userId, isActive: true }),
    ]);
    return { urls, total };
  }

  async create(data: {
    shortCode: string;
    originalUrl: string;
    customAlias: boolean;
    userId?: Types.ObjectId;
    expiresAt?: Date;
  }): Promise<IUrl> {
    const url = new UrlModel(data);
    return url.save();
  }

  async update(
    shortCode: string,
    userId: Types.ObjectId,
    data: Partial<Pick<IUrl, 'expiresAt' | 'isActive'> & { shortCode: string }>
  ): Promise<IUrl | null> {
    return UrlModel.findOneAndUpdate({ shortCode, userId }, { $set: data }, { new: true });
  }

  async softDelete(shortCode: string, userId: Types.ObjectId): Promise<boolean> {
    const result = await UrlModel.findOneAndUpdate(
      { shortCode, userId },
      { $set: { isActive: false } }
    );
    return result !== null;
  }

  async incrementClickCount(shortCode: string): Promise<void> {
    await UrlModel.updateOne({ shortCode }, { $inc: { clickCount: 1 } });
  }
}
