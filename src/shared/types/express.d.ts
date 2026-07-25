import type { IUser } from '../../modules/auth/models/user.model.js';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export {};
