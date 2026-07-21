
import type {
  Request,
  Response,
  NextFunction,
} from "express";
import { IAuthRepository } from "../repository/interface/auth.repository.interface.js";
import { SignUpDto } from "../dto/signup.dto.js";
import { LoginDto } from "../dto/login.dto.js";
import { ChangePasswordDto } from "../dto/change-password.dto.js";
import { ChangePasswordResult } from "../types/auth.types.js";
import { ValidationError } from "../../../shared/errors/validation.error.js";
import { err } from "../../../shared/result/result.js";
import { COOKIE_OPTIONS } from "../../../shared/config/cookie.js";

export class AuthController {

    constructor(

        private readonly repository:IAuthRepository

    ){}

    async signUp(req:Request){

        const dto = new SignUpDto(

            req.body.username,

            req.body.email,

            req.body.password

        );

        return this.repository.signUp(dto);

    }

  async login(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {

    const dto = new LoginDto(
      req.body.username,
      req.body.password
    );

    const result =
      await this.repository.login(dto);

    if (!result.ok) {
      return result;
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict" as const,
    };

    res.cookie(
      "accessToken",
      result.value.accessToken,
      options
    );

    res.cookie(
      "refreshToken",
      result.value.refreshToken,
      options
    );

    return result;
  }



async changePassword(
  req: Request,
  _res: Response,
  _next: NextFunction
) {
  const dto = new ChangePasswordDto(
    req.body.oldPassword,
    req.body.newPassword,
    req.body.confirmPassword
  );

  if (dto.newPassword !== dto.confirmPassword) {
    return err(
      new ValidationError(
        "New password and confirm password do not match."
      )
    );
  }

  return this.repository.changePassword(
    req.user._id.toString(),
    dto
  );
}

async logout(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const result =
    await this.repository.logout(
      req.user._id.toString()
    );

  if (!result.ok) {
    return result;
  }

  res.clearCookie("accessToken",COOKIE_OPTIONS);
  res.clearCookie("refreshToken",COOKIE_OPTIONS);

  return result;
}

async refreshAccessToken(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const refreshToken =
    req.cookies?.refreshToken;

  const result =
    await this.repository.refreshAccessToken(
      refreshToken
    );

  if (!result.ok) {
    return result;
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
  };

  res.cookie(
    "accessToken",
    result.value.accessToken,
    options
  );

  res.cookie(
    "refreshToken",
    result.value.refreshToken,
    options
  );

  return result;
}

async logoutAll(
    req:Request,
    res:Response,
    _next:NextFunction
){

    const result =
        await this.repository.logoutAll(
            req.user._id.toString()
        );

    if(!result.ok){
        return result;
    }

    res.clearCookie(
        "accessToken",
        COOKIE_OPTIONS
    );

    res.clearCookie(
        "refreshToken",
        COOKIE_OPTIONS
    );

    return result;

}
}
