import { Router } from "express";
import { AuthRepository } from "../repository/auth.repository.impl.js";
import { AuthController } from "../controller/auth.controller.impl.js";
import { verifyjwt } from "../../../shared/security/middleware/verifyJwt.middleware.js";
import { handle } from "../../../shared/http/handle.js";
import {
  SIGNUP,
  LOGIN,
  LOGOUT,
  LOGOUT_ALL,
  REFRESH,
  RESET_PASSWORD,
} from "../../../shared/types/api-endpoint/auth.api.endpoint.js";

const router = Router();

const authRepository = new AuthRepository();
const authController = new AuthController(authRepository);

router.post(
  SIGNUP,
  handle(authController.signUp.bind(authController))
);

router.post(
  LOGIN,
  handle(authController.login.bind(authController))
);

router.post(
  RESET_PASSWORD,
  verifyjwt,
  handle(authController.changePassword.bind(authController))
);

router.post(
  LOGOUT,
  verifyjwt,
  handle(authController.logout.bind(authController))
);

router.post(
  REFRESH,
  handle(authController.refreshAccessToken.bind(authController))
);

router.post(
  LOGOUT_ALL,
  verifyjwt,
  handle(authController.logoutAll.bind(authController))
);

export default router;