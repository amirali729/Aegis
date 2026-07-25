import { Router } from 'express';

import { AuthRepository } from '../repository/auth.repository.impl.js';
import { AuthService } from '../service/auth.service.impl.js';
import { AuthController } from '../controller/auth.controller.impl.js';
import { ConsoleMailer } from '../../email/console.mailer.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { mapAuthError } from '../http/map-auth-error.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';

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

const authService = new AuthService(authRepository, mailer, clientUrl);
const authController = new AuthController(authService);

// Public
router.post(
  SIGNUP,
  handle(authController.signUp.bind(authController), mapAuthError, HttpStatus.CREATED),
);

router.post(LOGIN, handle(authController.login.bind(authController), mapAuthError));

router.post(REFRESH, handle(authController.refreshAccessToken.bind(authController), mapAuthError));

router.post(VERIFY_EMAIL, handle(authController.verifyEmail.bind(authController), mapAuthError));

router.post(
  RESEND_VERIFICATION,
  handle(authController.resendVerification.bind(authController), mapAuthError),
);

router.post(
  FORGOT_PASSWORD,
  handle(authController.forgotPassword.bind(authController), mapAuthError),
);

router.post(
  RESET_PASSWORD,
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
  handle(authController.changePassword.bind(authController), mapAuthError),
);

export default router;
