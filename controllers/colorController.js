const asyncHandler = require("express-async-handler");
const Color = require("../models/colorModel");
const validateMongodbId = require("../utils/validateMongodbId");

const getAllColors = asyncHandler(async (req, res) => {
    try {
        const colors = await Color.find();

        res.status(200).json({
            status: "success",
            results: colors.length,
            data: colors,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const createColor = asyncHandler(async (req, res) => {
    try {
        const newColor = await Color.create(req.body);

        res.status(200).json({
            status: "success",
            data: newColor,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getColorById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const color = await Color.findById(id);

        res.status(200).json({
            status: "success",
            data: color,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updateColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        res.status(200).json({
            status: "success",
            data: updatedColor,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const deleteColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedColor = await Color.findByIdAndDelete(id);

        res.status(200).json({
            status: "success",
            message: "Deleted a Color",
        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    getAllColors,
    getColorById,
    createColor,
    updateColor,
    deleteColor,
};
