import { User } from "../models/user.model.js";
import { InfrastructureError } from "../../../shared/errors/infrastructure.error.js";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function generateTokenPair(
  userId: string
): Promise<TokenPair> {
  const user = await User.findById(userId);

  if (!user) {
    throw new InfrastructureError("User not found while generating tokens.");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({
    validateBeforeSave: false,
  });

  return {
    accessToken,
    refreshToken,
  };
}