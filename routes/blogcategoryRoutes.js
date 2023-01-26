const express = require("express");
const blogcategoryController = require("../controllers/blogcategoryController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router
    .route("/")
    .get(blogcategoryController.getAllCategories)
    .post(authMiddleware, isAdmin, blogcategoryController.createCategory);

router
    .route("/:id")
    .get(blogcategoryController.getCategoryById)
    .put(authMiddleware, isAdmin, blogcategoryController.updateCategory)
    .delete(authMiddleware, isAdmin, blogcategoryController.deleteCategory);

module.exports = router;
