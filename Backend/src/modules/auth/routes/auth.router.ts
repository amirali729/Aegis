import { Router } from "express";
import { signUp, login, changedPassword, logout } from "../controllers/auth.controller.js";
import { verifyjwt } from "../middleware/verifyJwt.middleware.js";
import { logoutAll, refreshAccessToken } from "../controllers/token.controller.js";
import { SIGNUP,LOGIN,LOGOUT,LOGOUT_ALL,REFRESH,RESET_PASSWORD } from "../types/api-endpoint/auth.api.endpoint.js";


const router = Router()

router.route(`${SIGNUP}`).post(signUp)
router.route(`${LOGIN}`).post(login)
router.route(`${LOGOUT}`).post(verifyjwt,logout)
router.route(`${RESET_PASSWORD}`).post(verifyjwt,changedPassword)
router.route(`${REFRESH}`).post(verifyjwt,refreshAccessToken)
router.route(`${LOGOUT_ALL}`).post(verifyjwt,logoutAll)


export default router