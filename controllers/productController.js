const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");

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
        // Filtering
        const { ...queryObj } = req.query;
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte)\b/g,
            (match) => `$${match}`
        );

        let query = Product.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // Limiting the fields
        if (req.query.fields) {
            const fields = req.query.limit.fields(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        // Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const records = await Product.countDocuments();
            if (skip >= records) throw new Error("This Page does not exist");
        }

        const products = await query;

        res.status(200).json({
            status: "success",
            results: products.length,
            data: products,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        await Product.findByIdAndDelete(id);

        res.status(201).json({
            status: "success",
            message: "Deleted a product",
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        res.status(200).json({
            status: "success",
            data: product,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const addToWishList = asyncHandler(async (req, res) => {
    const { _id } = req?.user;
    const { prodId } = req.body;
    const user = await User.findById(_id);

    const alreadyAdded = user?.wishlist.find(
        (pro) => pro._id.toString() == prodId.toString()
    );

    let updatedWishlist;
    if (alreadyAdded) {
        updatedWishlist = await User.findByIdAndUpdate(
            _id,
            {
                $pull: { wishlist: prodId },
            },
            {
                new: true,
            }
        );
    } else {
        updatedWishlist = await User.findByIdAndUpdate(
            _id,
            {
                $push: { wishlist: prodId },
            },
            {
                new: true,
            }
        );
    }

    res.status(200).json({
        status: "success",
        data: updatedWishlist,
    });
});

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, comment, prodId } = req.body;

    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedBy.toString() === _id.toString()
        );

        let updatedRating;
        if (alreadyRated) {
            updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated },
                },
                {
                    $set: {
                        "ratings.$.star": star,
                        "ratings.$.comment": comment,
                    },
                },
                {
                    new: true,
                }
            );
        } else {
            updatedRating = await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: {
                            star,
                            comment,
                            postedBy: _id,
                        },
                    },
                },
                {
                    new: true,
                }
            );
        }

        const getAllRatings = await Product.findById(prodId);
        let totalRating = getAllRatings.ratings.length;
        let ratingSum = getAllRatings.ratings
            .map((item) => item.star)
            .reduce((prev, cur) => {
                return prev + cur;
            }, 0);
        let actualRating = Math.round(ratingSum / totalRating);
        let finalProduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalRatings: actualRating,
            },
            {
                new: true,
            }
        );

        res.status(200).json({
            status: "success",
            data: finalProduct,
        });
    } catch (error) {
        throw new Error(error);
    }
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
        const findProduct = await Product.findByIdAndUpdate(
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
            data: findProduct,
        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
    updateProduct,
    addToWishList,
    rating,
    uploadImages,
};
