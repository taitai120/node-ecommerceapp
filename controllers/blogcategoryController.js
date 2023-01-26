const asyncHandler = require("express-async-handler");
const Category = require("../models/blogcategoryModel");
const validateMongodbId = require("../utils/validateMongodbId");

const getAllCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find();

        res.status(200).json({
            status: "success",
            results: categories.length,
            data: categories,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);

        res.status(200).json({
            status: "success",
            data: newCategory,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const category = await Category.findById(id);

        res.status(200).json({
            status: "success",
            data: category,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        res.status(200).json({
            status: "success",
            data: updatedCategory,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedCategory = await Category.findByIdAndDelete(id);

        res.status(200).json({
            status: "success",
            message: "Deleted a category",
        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
