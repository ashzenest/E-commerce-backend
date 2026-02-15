import { Router } from "express";
import {changeCurrentPassword, loginUser, logoutUser, refreshAccessToken, registerUser} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register-user").post(upload.single("avatar"), registerUser)
router.route("/login-user").post(loginUser)

//SECURE ROUTE
router.route("/refresh-tokens").post(refreshAccessToken)
router.route("/logout-user").post(verifyJWT, logoutUser)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)

export default router