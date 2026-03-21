import { Router } from "express";
import {addToWishlist, changeCurrentPassword, changeEmailRequest, changePasswordRequest, changeUsername, getCurrentUser, getOrderById, getOrders, getReviews, getWishlist, loginUser, logoutUser, refreshAccessToken, registerUser, removeFromWishlist, updateFullname, updateUserAvatar, usernameAvailableOrNot, verifychangeEmailRequest, verifyChangePasswordRequest} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { blacklistCheck } from "../middlewares/blacklist.middleware.js";
import { loginIpRateLimiter, registerIpRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router()

router.route("/register-user").post(registerIpRateLimiter, upload.single("avatar"), registerUser)
router.route("/login-user").post(loginIpRateLimiter, loginUser)
router.route("/verify-password-reset").post(verifyChangePasswordRequest)
router.route("/verify-email-change").get(verifychangeEmailRequest)
router.route("/refresh-tokens").post(refreshAccessToken)
router.route("/forgot-password").post(changePasswordRequest)

router.use(verifyJWT, blacklistCheck)

router.route("/logout-user").post(logoutUser)
router.route("/change-password").post(changeCurrentPassword)
router.route("/update-avatar").post(upload.single("avatar"), updateUserAvatar)
router.route("/change-fullname").post(updateFullname)
router.route("/check-username").get(usernameAvailableOrNot)
router.route("/change-username").patch(changeUsername)
router.route("/request-email-change").post(changeEmailRequest)
router.route("/me").get(getCurrentUser)
router.route("/me/reviews").get(getReviews)
router.route("/me/get-wishlist").get(getWishlist)
router.route("/me/get-orders").get(getOrders)
router.route("/add-to-wishlist/:productId").post(addToWishlist)
router.route("/remove-from-wishlist/:productId").post(removeFromWishlist)
router.route("/me/orders/:orderId").get(getOrderById)
export default router