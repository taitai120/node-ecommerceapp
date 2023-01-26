const asyncHandler = require("express-async-handler");
const Blog = require("../models/blogModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");

const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find().populate("likes").populate("dislikes");

        res.status(200).json({
            status: "success",
            results: blogs.length,
            data: blogs,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const blog = await Blog.findById(id)
            .populate("likes")
            .populate("dislikes");
        const updatedViews = await Blog.findByIdAndUpdate(
            id,
            { $inc: { numViews: 1 } },
            { new: true }
        );

        if (blog) {
            res.status(200).json({
                status: "success",
                data: blog,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);

        res.status(200).json({
            status: "success",
            data: newBlog,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true });

        if (blog) {
            res.status(200).json({
                status: "success",
                data: blog,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const blog = await Blog.findByIdAndDelete(id);

        if (blog) {
            res.status(200).json({
                status: "success",
                message: "Deleted a blog",
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);

    // Find the blog that be liked
    const blog = await Blog.findById(blogId);

    // Find the login user
    const loginUserId = req?.user?._id;

    // Find if the user has liked the blog
    const isLiked = blog?.isLiked;

    // Find if the user has disliked the blog
    const alreadyDisliked = blog?.dislikes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );

    // If already disliked, remove it
    if (alreadyDisliked) {
        await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisliked: false,
            },
            {
                new: true,
            }
        );
    }

    let updatedBlog;
    // Add or remove like
    if (isLiked) {
        updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            {
                new: true,
            }
        );
    } else {
        updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { likes: loginUserId },
                isLiked: true,
            },
            {
                new: true,
            }
        );
    }

    res.status(200).json({
        status: "success",
        data: updatedBlog,
    });
});

const dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);

    // Find the blog that be liked
    const blog = await Blog.findById(blogId);

    // Find the login user
    const loginUserId = req?.user?._id;

    // Find if the user has liked the blog
    const isDisliked = blog?.isDisliked;

    // Find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );

    // If already liked, remove it
    if (alreadyLiked) {
        await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            {
                new: true,
            }
        );
    }

    let updatedBlog;
    // Add or remove dislike
    if (isDisliked) {
        updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisliked: false,
            },
            {
                new: true,
            }
        );
    } else {
        updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { dislikes: loginUserId },
                isDisliked: true,
            },
            {
                new: true,
            }
        );
    }

    res.status(200).json({
        status: "success",
        data: updatedBlog,
    });
});

const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;

        for (let file of files) {
            const { path } = file;
            const newpath = await uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
        }
        const findBlog = await Blog.findByIdAndUpdate(
            id,
            {
                images: urls.map((file) => file),
            },
            {
                new: true,
            }
        );

        res.status(200).json({
            status: "success",
            data: findBlog,
        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    dislikeBlog,
    uploadImages,
};
