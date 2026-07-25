import type { Response } from 'express';
import { COOKIE_OPTIONS } from '../config/cookie.js';

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie('accessToken', accessToken, COOKIE_OPTIONS);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', COOKIE_OPTIONS);

  res.clearCookie('refreshToken', COOKIE_OPTIONS);
}
