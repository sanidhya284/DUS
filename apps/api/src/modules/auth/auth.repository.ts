import { UserModel, IUser } from './auth.model';

export class AuthRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email, isActive: true });
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async create(email: string, passwordHash: string): Promise<IUser> {
    const user = new UserModel({ email, passwordHash });
    return user.save();
  }

  async emailExists(email: string): Promise<boolean> {
    const result = await UserModel.exists({ email });
    return result !== null;
  }
}
