import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createProduct, deleteProduct, getAllProducts, getProductById, getProductsBySeller, updateProduct } from "../controllers/product.controllers.js";

const router = Router()

router.route("/").get(getAllProducts)
router.route("/:productId").get(getProductById)
router.route("/seller/:sellerId").get(getProductsBySeller)

router.route("/create").post(verifyJWT, upload.array("images", 10), createProduct)
router.route("/update/:productId").patch(verifyJWT, upload.array("images", 10), updateProduct)
router.route("/delete/:productId").delete(verifyJWT, deleteProduct)

export default router