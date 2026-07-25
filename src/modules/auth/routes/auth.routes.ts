import { Router } from 'express';

import { AuthRepository } from '../repository/auth.repository.impl.js';
import { AuthService } from '../service/auth.service.impl.js';
import { AuthController } from '../controller/auth.controller.impl.js';
import { ConsoleMailer } from '../../email/console.mailer.js';
import { DefaultRoleProvider } from '../../role/service/default-role-provider.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { mapAuthError } from '../http/map-auth-error.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import {
  authRateLimiter,
  sensitiveActionRateLimiter,
} from '../../../shared/security/middleware/rate-limit.middleware.js';

import {
  signUpSchema,
  loginSchema,
  changePasswordSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validation/auth.schemas.js';

import {
  SIGNUP,
  LOGIN,
  REFRESH,
  LOGOUT,
  LOGOUT_ALL,
  CHANGE_PASSWORD,
  VERIFY_EMAIL,
  RESEND_VERIFICATION,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
} from '../../../shared/api-endpoint/auth.api.endpoint.js';

const router = Router();

// Composition root: swap ConsoleMailer for a real provider (SMTP,
// Resend, SES, ...) here in production without touching AuthService.
const authRepository = new AuthRepository();
const mailer = new ConsoleMailer();
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
const defaultRoleProvider = new DefaultRoleProvider();

const authService = new AuthService(authRepository, mailer, clientUrl, defaultRoleProvider);
const authController = new AuthController(authService);

// Public
router.post(
  SIGNUP,
  authRateLimiter,
  validate({ body: signUpSchema }),
  handle(authController.signUp.bind(authController), mapAuthError, HttpStatus.CREATED),
);

router.post(
  LOGIN,
  authRateLimiter,
  validate({ body: loginSchema }),
  handle(authController.login.bind(authController), mapAuthError),
);

router.post(
  REFRESH,
  authRateLimiter,
  handle(authController.refreshAccessToken.bind(authController), mapAuthError),
);

router.post(VERIFY_EMAIL, handle(authController.verifyEmail.bind(authController), mapAuthError));

router.post(
  RESEND_VERIFICATION,
  sensitiveActionRateLimiter,
  validate({ body: resendVerificationSchema }),
  handle(authController.resendVerification.bind(authController), mapAuthError),
);

router.post(
  FORGOT_PASSWORD,
  sensitiveActionRateLimiter,
  validate({ body: forgotPasswordSchema }),
  handle(authController.forgotPassword.bind(authController), mapAuthError),
);

router.post(
  RESET_PASSWORD,
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  handle(authController.resetPassword.bind(authController), mapAuthError),
);

// Protected
router.post(LOGOUT, verifyjwt, handle(authController.logout.bind(authController), mapAuthError));

router.post(
  LOGOUT_ALL,
  verifyjwt,
  handle(authController.logoutAll.bind(authController), mapAuthError),
);

router.post(
  CHANGE_PASSWORD,
  verifyjwt,
  validate({ body: changePasswordSchema }),
  handle(authController.changePassword.bind(authController), mapAuthError),
);

export default router;
