const express = require("express");
const prodcategoryController = require("../controllers/prodcategoryController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router
    .route("/")
    .get(prodcategoryController.getAllCategories)
    .post(authMiddleware, isAdmin, prodcategoryController.createCategory);

router
    .route("/:id")
    .get(prodcategoryController.getCategoryById)
    .put(authMiddleware, isAdmin, prodcategoryController.updateCategory)
    .delete(authMiddleware, isAdmin, prodcategoryController.deleteCategory);

module.exports = router;
