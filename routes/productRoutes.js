const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", authMiddleware, isAdmin, productController.createProduct);
router.post("/:id", authMiddleware, isAdmin, productController.deleteProduct);
router.put("/:id", authMiddleware, isAdmin, productController.updateProduct);

module.exports = router;
