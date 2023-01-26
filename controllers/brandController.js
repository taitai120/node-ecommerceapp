const asyncHandler = require("express-async-handler");
const Brand = require("../models/brandModel");
const validateMongodbId = require("../utils/validateMongodbId");

const getAllBrands = asyncHandler(async (req, res) => {
    try {
        const brands = await Brand.find();

        res.status(200).json({
            status: "success",
            results: brands.length,
            data: brands,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const createBrand = asyncHandler(async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);

        res.status(200).json({
            status: "success",
            data: newBrand,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getBrandById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const brand = await Brand.findById(id);

        res.status(200).json({
            status: "success",
            data: brand,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        res.status(200).json({
            status: "success",
            data: updatedBrand,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedBrand = await Brand.findByIdAndDelete(id);

        res.status(200).json({
            status: "success",
            message: "Deleted a brand",
        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
};
