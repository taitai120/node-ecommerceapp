const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", brandController.getAllBrands);
router.post("/", authMiddleware, isAdmin, brandController.createBrand);

router
    .route("/:id")
    .get(brandController.getBrandById)
    .put(authMiddleware, isAdmin, brandController.updateBrand)
    .delete(authMiddleware, isAdmin, brandController.deleteBrand);

module.exports = router;
