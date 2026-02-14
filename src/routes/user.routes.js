import { Router } from "express";
import {loginUser, refreshAccessToken, registerUser} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register-user").post(upload.single("avatar"), registerUser)
router.route("/login-user").post(loginUser)
router.route("/refresh-tokens").post(refreshAccessToken)

export default router