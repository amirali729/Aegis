import { InfrastructureError } from "../../../shared/errors/infrastructure.error.js";
import { ValidationError } from "../../../shared/errors/validation.error.js";
import { err, ok } from "../../../shared/result/result.js";
import { ChangePasswordDto } from "../dto/change-password.dto.js";
import { LoginDto } from "../dto/login.dto.js";
import { SignUpDto } from "../dto/signup.dto.js";
import { EmailAlreadyExistsError } from "../errors/email-already-exists.error.js";
import { InvalidPasswordError } from "../errors/invalid-password.error.js";
import { InvalidTokenError } from "../errors/invalid-token.error.js";
import { UserNotFoundError } from "../errors/user-not-found.error.js";
import { UsernameAlreadyExistsError } from "../errors/username-already-exists.error.js";
import { User } from "../models/user.model.js";
import { ChangePasswordResponse } from "../responses/change-password.response.js";
import { LoginResponse } from "../responses/login.response.js";
import { LogoutResponse } from "../responses/logout.response.js";
import { RefreshTokenResponse } from "../responses/RefreshTokenResponse.js";
import { SignUpResponse } from "../responses/signup.response.js";
import { generateTokenPair } from "../service/token.service.js";
import { ChangePasswordResult, LoginResult, LogoutResult, RefreshTokenResult, SignUpResult } from "../types/auth.types.js";
import { IAuthRepository } from "./interface/auth.repository.interface.js";
import  jwt  from "jsonwebtoken";


export class AuthRepository implements IAuthRepository {
    async signUp(
    dto: SignUpDto
): Promise<SignUpResult> {

    try {

        const existingUser = await User.findOne({

            $or:[
                {username:dto.username},
                {email:dto.email}
            ]

        });

        if(existingUser){

            if(existingUser.email===dto.email){

                return err(
                    new EmailAlreadyExistsError()
                );

            }

            return err(
                new UsernameAlreadyExistsError()
            );

        }

        const user = await User.create({

            username:dto.username,

            email:dto.email,

            password:dto.password

        });

        const createdUser = await User.findById(
            user._id
        )
        .select("-password -refreshToken")
        .lean();

        if(!createdUser){

            return err(
                new InfrastructureError(
                    "Could not create account."
                )
            );

        }

        return ok(

            new SignUpResponse(
                createdUser
            )

        );

    }

    catch(error){

        return err(

            new InfrastructureError()

        );

    }

}

async login(
    dto: LoginDto
): Promise<LoginResult> {

    try{

        const user = await User.findOne({

            username:dto.username

        });

        if(!user){

            return err(
                new UserNotFoundError()
            );

        }

        const isPasswordCorrect =
            await user.isPasswordCorrect(
                dto.password
            );

        if(!isPasswordCorrect){

            return err(
                new InvalidPasswordError()
            );

        }

        const {

            accessToken,

            refreshToken

        } = await generateTokenPair(
            user._id.toString()
        );

        const loginUser =
            await User.findById(user._id)
            .select("-password -refreshToken")
            .lean();

        if(!loginUser){

            return err(
                new InfrastructureError(
                    "Could not load user."
                )
            );

        }

        return ok(

            new LoginResponse(

                loginUser,

                accessToken,

                refreshToken

            )

        );

    }

    catch{

        return err(

            new InfrastructureError()

        );

    }

}
async changePassword(
  userId: string,
  dto: ChangePasswordDto
): Promise<ChangePasswordResult> {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return err(
        new UserNotFoundError()
      );
    }

    const isPasswordCorrect =
      await user.isPasswordCorrect(dto.oldPassword);

    if (!isPasswordCorrect) {
      return err(
        new InvalidPasswordError()
      );
    }

    user.password = dto.newPassword;

    await user.save();

    return ok(
      new ChangePasswordResponse()
    );

  } catch {
    return err(
      new InfrastructureError()
    );
  }
}

async logout(
  userId: string
): Promise<LogoutResult> {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return err(
        new UserNotFoundError()
      );
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          refreshToken: 1,
        },
      }
    );

    return ok(
      new LogoutResponse()
    );

  } catch {
    return err(
      new InfrastructureError()
    );
  }
}



async refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenResult> {
  try {
    if (!refreshToken) {
      return err(new InvalidTokenError());
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { _id: string };

    const user = await User.findById(decoded._id);

    if (!user) {
      return err(new UserNotFoundError());
    }

    if (user.refreshToken !== refreshToken) {
      return err(new InvalidTokenError());
    }

    const tokens =
      await generateTokenPair(
        user._id.toString()
      );

    return ok(
      new RefreshTokenResponse(
        tokens.accessToken,
        tokens.refreshToken
      )
    );

  } catch {
    return err(
      new InfrastructureError()
    );
  }
}
}