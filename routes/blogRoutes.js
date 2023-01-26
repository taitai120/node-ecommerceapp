const express = require("express");
const blogController = require("../controllers/blogController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");

const router = express.Router();

router.get("/", blogController.getAllBlogs);
router.post("/", authMiddleware, isAdmin, blogController.createBlog);
router.post("/like", authMiddleware, blogController.likeBlog);
router.post("/dislike", authMiddleware, blogController.dislikeBlog);

router
    .route("/:id")
    .get(authMiddleware, blogController.getBlogById)
    .put(authMiddleware, isAdmin, blogController.updateBlog)
    .delete(authMiddleware, isAdmin, blogController.deleteBlog);

router.put(
    "/upload/:id",
    authMiddleware,
    isAdmin,
    uploadPhoto.array("images", 2),
    blogImgResize,
    blogController.uploadImages
);

module.exports = router;
