const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const {
    uploadPhoto,
    productImgResize,
} = require("../middlewares/uploadImages");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", productController.getAllProducts);
router.post("/", authMiddleware, isAdmin, productController.createProduct);

router
    .route("/:id")
    .get(productController.getProductById)
    .put(authMiddleware, isAdmin, productController.updateProduct)
    .delete(authMiddleware, isAdmin, productController.deleteProduct);

router.post("/add-wishlist", authMiddleware, productController.addToWishList);
router.post("/rating", authMiddleware, productController.rating);
router.put(
    "/upload/:id",
    authMiddleware,
    isAdmin,
    uploadPhoto.array("images", 10),
    productImgResize,
    productController.uploadImages
);

module.exports = router;
