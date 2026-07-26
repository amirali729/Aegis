import type { IUser } from '../../modules/auth/model/user.model.ts';
import type { IApplication } from '../../modules/application/model/application.model.ts';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
      tenantId?: string;
      application?: IApplication;
    }
  }
}

export {};
