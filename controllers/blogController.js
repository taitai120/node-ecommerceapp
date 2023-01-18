const asyncHandler = require("express-async-handler");
const Blog = require("../models/blogModel");
const validateMongoDbId = require("../utils/validateMongodbId");

const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find();

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
        const blog = await Blog.findById(id);
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

    if (loginUserId) {
        const index = blog.likes.find((el) => el.id === loginUserId);

        if (index === -1) {
            blog.likes.push(loginUserId);
        } else {
            blog.likes = blog.likes.filter((id) => id !== loginUserId);
        }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, blog, {
        new: true,
    });

    await blog.save();

    res.status(200).json({
        status: "success",
        data: updatedBlog,
    });
});

module.exports = {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
};
