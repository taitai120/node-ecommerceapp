const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.status(200).json({
            status: "success",
            data: newProduct,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);

        res.status(200).json({
            status: "success",
            data: product,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            status: "success",
            data: products,
        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { createProduct, getProductById, getAllProducts };