import type { IUser } from '../../modules/auth/model/user.model.ts';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export {};
