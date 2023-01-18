const express = require("express");
const blogController = require("../controllers/blogController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", blogController.getAllBlogs);
router.get("/:id", authMiddleware, isAdmin, blogController.getBlogById);
router.post("/", authMiddleware, isAdmin, blogController.createBlog);
router.put("/:id", authMiddleware, isAdmin, blogController.updateBlog);
router.delete("/:id", authMiddleware, isAdmin, blogController.deleteBlog);

router.post("/like-blog", authMiddleware, blogController.likeBlog);

module.exports = router;
