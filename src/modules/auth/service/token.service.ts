import type { IUser } from '../model/user.model.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function generateTokenPair(user: IUser): Promise<TokenPair> {
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
