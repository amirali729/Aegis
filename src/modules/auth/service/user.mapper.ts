import type { IUser } from '../models/user.model.js';
import { UserResponse } from '../responses/user.response.js';

export function toUserResponse(user: IUser): UserResponse {
  return new UserResponse(user._id.toString(), user.username, user.email, user.createdAt);
}
