import { Router } from "express";

import { AuthRepository } from "../repository/auth.repository.impl.js";
import { AuthController } from "../controller/auth.controller.impl.js";

import { handle } from "../../../shared/http/handle.js";
import { verifyjwt } from "../../../shared/security/middleware/verifyJwt.middleware.js";

import {
  SIGNUP,
  LOGIN,
  REFRESH,
  LOGOUT,
  LOGOUT_ALL,
  RESET_PASSWORD,
} from "../../../shared/types/api-endpoint/auth.api.endpoint.js";

const router = Router();

const authRepository = new AuthRepository();
const authController = new AuthController(authRepository);

// Public
router.post(
  SIGNUP,
  handle(authController.signUp.bind(authController))
);

router.post(
  LOGIN,
  handle(authController.login.bind(authController))
);

router.post(
  REFRESH,
  handle(authController.refreshAccessToken.bind(authController))
);

// Protected
router.post(
  LOGOUT,
  verifyjwt,
  handle(authController.logout.bind(authController))
);

router.post(
  LOGOUT_ALL,
  verifyjwt,
  handle(authController.logoutAll.bind(authController))
);

router.post(
  RESET_PASSWORD,
  verifyjwt,
  handle(authController.changePassword.bind(authController))
);

export default router;