import { Router } from "express";
import { handle } from "../../../shared/http/handle.js";
import {
  LOGIN,
  LOGOUT,
  LOGOUT_ALL,
  REFRESH,
  RESET_PASSWORD,
  SIGNUP,
} from "../../../shared/types/api-endpoint/auth.api.endpoint.js";
import { AuthRepository } from "../repository/auth.repository.impl.js";
import { AuthController } from "../controller/auth.controller.impl.js";
import { verifyjwt } from "../../../shared/security/middleware/verifyJwt.middleware.js";

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


// These can stay as they are for now
router.post(
  REFRESH,
  verifyjwt,
  refreshAccessToken
);

router.post(
  LOGOUT_ALL,
  verifyjwt,
  handle(authController.logoutAll.bind(authController))
);
router.post(
  LOGOUT,
  verifyjwt,
  handle(authController.logout.bind(authController))
);

router.post(
  REFRESH,
  handle(
    authController.refreshAccessToken.bind(authController)
  )
);

export default router;