import { InfrastructureError } from "../../../shared/errors/infrastructure.error.js";
import { ValidationError } from "../../../shared/errors/validation.error.js";
import { err, ok } from "../../../shared/result/result.js";
import { generateUserAccessAndRefreshToken } from "../controller/token.controller.impl.js";
import { ChangePasswordDto } from "../dto/change-password.dto.js";
import { LoginDto } from "../dto/login.dto.js";
import { SignUpDto } from "../dto/signup.dto.js";
import { EmailAlreadyExistsError } from "../errors/email-already-exists.error.js";
import { InvalidPasswordError } from "../errors/invalid-password.error.js";
import { UserNotFoundError } from "../errors/user-not-found.error.js";
import { UsernameAlreadyExistsError } from "../errors/username-already-exists.error.js";
import { User } from "../models/user.model.js";
import { ChangePasswordResponse } from "../responses/change-password.response.js";
import { LoginResponse } from "../responses/login.response.js";
import { LogoutResponse } from "../responses/logout.response.js";
import { SignUpResponse } from "../responses/signup.response.js";
import { ChangePasswordResult } from "../types/auth.types.js";
import { IAuthRepository } from "./interface/auth.repository.interface.js";

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

        } = await generateUserAccessAndRefreshToken(
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
}