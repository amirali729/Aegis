import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { SignUpDto } from '../dto/signup.dto.js';
import type { IUser } from '../model/user.model.js';
import { User } from '../model/user.model.js';
import type { DataResult, IAuthRepository } from './interface/auth.repository.interface.js';

export class AuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<DataResult<IUser | null>> {
    try {
      const user = await User.findOne({ email });
      return ok(user);
    } catch (error) {
      console.error(error);
      return err(new InfrastructureError());
    }
  }

  async findByUsername(username: string, tenantId?: string): Promise<DataResult<IUser | null>> {
    try {
      const user = await User.findOne(tenantId ? { username, tenantId } : { username }).select(
        '+password',
      );
      return ok(user);
    } catch (error) {
      console.error(error);
      return err(new InfrastructureError());
    }
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
    tenantId?: string,
  ): Promise<DataResult<IUser | null>> {
    try {
      const user = await User.findOne({
        $or: [{ email }, { username }],
        ...(tenantId && { tenantId }),
      });
      return ok(user);
    } catch (error) {
      console.error(error);
      return err(new InfrastructureError());
    }
  }

  async findById(userId: string): Promise<DataResult<IUser | null>> {
    try {
      const user = await User.findById(userId).select('+password');
      return ok(user);
    } catch (error) {
      console.error(error);
      return err(new InfrastructureError());
    }
  }

  async findByEmailVerificationTokenHash(tokenHash: string): Promise<DataResult<IUser | null>> {
    try {
      const user = await User.findOne({
        emailVerificationToken: tokenHash,
        emailVerificationExpiry: { $gt: new Date() },
      });
      return ok(user);
    } catch (error) {
      console.error(error);
      return err(new InfrastructureError());
    }
  }

  async findByPasswordResetTokenHash(tokenHash: string): Promise<DataResult<IUser | null>> {
    try {
      const user = await User.findOne({
        passwordResetToken: tokenHash,
      });
      return ok(user);
    } catch (error) {
      console.error(error);
      return err(new InfrastructureError());
    }
  }

  async createUser(dto: SignUpDto, tenantId?: string): Promise<DataResult<IUser>> {
    try {
      const user = await User.create({
        tenantId,
        username: dto.username,
        email: dto.email,
        password: dto.password,
      });
      return ok(user);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async save(user: IUser, options?: { validateBeforeSave?: boolean }): Promise<DataResult<IUser>> {
    try {
      const saved = await user.save({
        validateBeforeSave: options?.validateBeforeSave ?? true,
      });
      return ok(saved);
    } catch (error) {
      console.error(error);
      return err(new InfrastructureError());
    }
  }

  async deleteById(userId: string): Promise<DataResult<boolean>> {
    try {
      const result = await User.findByIdAndDelete(userId);
      return ok(!!result);
    } catch (error) {
      console.error(error);
      return err(new InfrastructureError());
    }
  }
}
