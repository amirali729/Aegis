import { Router } from "express";
import { verifyjwt } from "../middleware/verifyJwt.middleware.js";
import { USER,USER_ID,USER_ME } from "../types/api-endpoint/user.api.endpoint.js";
import { getAllUsers,getUserById,GetUser,updateUser,updateUserById,deleteUser,deleteUserById } from "../controllers/user.controller.js";
// GET	/users	Get all users (Admin)
// GET	/users/:id	Get a specific user
// GET	/users/me	Get current user's profile
// PATCH	/users/me	Update current user's profile
// PATCH	/users/:id	Update any user (Admin)
// DELETE	/users/me	Delete own account
// DELETE	/users/:id	Delete user (Admin)
const router = Router()

router.route(`${USER}`).get(verifyjwt,getAllUsers)
router.route(`${USER_ID}`).get(verifyjwt,getUserById)
router.route(`${USER_ME}`).get(verifyjwt,GetUser)
router.route(`${USER_ME}`).patch(verifyjwt,updateUser)
router.route(`${USER_ID}`).post(verifyjwt,updateUserById)
router.route(`${USER_ME}`).delete(verifyjwt,deleteUser)
router.route(`${USER_ID}`).delete(verifyjwt,deleteUserById)

export default router