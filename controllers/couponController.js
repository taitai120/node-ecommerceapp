const asyncHandler = require("express-async-handler");
const Coupon = require("../models/couponModel");
const validateMongodbId = require("../utils/validateMongodbId");

const getAllCoupons = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.find();

        res.status(200).json({
            status: "success",
            results: coupons.length,
            data: coupons,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const createCoupon = asyncHandler(async (req, res) => {
    try {
        const newCoupon = await Coupon.create(req.body);

        res.status(200).json({
            status: "success",
            data: newCoupon,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getCouponById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const coupon = await Coupon.findById(id);

        res.status(200).json({
            status: "success",
            data: coupon,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        res.status(200).json({
            status: "success",
            data: updatedCoupon,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedCoupon = await Coupon.findByIdAndDelete(id);

        res.status(200).json({
            status: "success",
            message: "Deleted a coupon",
        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};
