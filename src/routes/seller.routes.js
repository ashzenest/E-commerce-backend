import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getDashboardStats, getMyOrders, getMyProducts, updateStock } from "../controllers/seller.controllers.js";

const router = Router()

router.route("/my-products").get(verifyJWT, getMyProducts)
router.route("/update-stock/:productId").patch(verifyJWT, updateStock)
router.route("/my-orders").get(verifyJWT, getMyOrders)
router.route("/get-stats").get(verifyJWT, getDashboardStats)

export default router