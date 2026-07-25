import type {
  Request,
  Response,
  NextFunction,
} from "express";
import { ChangePasswordResult, 
    LoginResult,
     LogoutResult,
      RefreshTokenResult,
       SignUpResult
} from "../../types/auth.types.js";


export interface IAuthController {
  signUp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SignUpResult>;

  login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<LoginResult>;

  changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<ChangePasswordResult>;

  logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<LogoutResult>;

  refreshAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<RefreshTokenResult>;

  logoutAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<LogoutResult>;
}