const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid");

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            status: "success",
            data: users,
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Get User By Id
const getUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const user = await User.findById(id);

        res.status(200).json({
            status: "success",
            data: user,
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a User
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        await User.findByIdAndDelete(id);

        res.status(201).json({
            status: "success",
            message: "Deleted",
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Update a User
const updateUser = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        validateMongoDbId(_id);
        const updateUser = await User.findByIdAndUpdate(
            _id,
            {
                firstName: req?.body?.firstName,
                lastName: req?.body?.lastName,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
                role: req?.body.role,
            },
            {
                new: true,
            }
        );

        res.status(200).json({
            status: "success",
            data: updateUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    try {
        const user = await User.findById(_id).populate("wishlist");

        res.status(200).json({
            status: "success",
            data: user,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updateAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { address } = req.body;
    validateMongoDbId(_id);

    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                address,
            },

            {
                new: true,
            }
        );

        res.status(200).json({
            status: "success",
            data: updatedUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const userCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { cart } = req.body;
    validateMongoDbId(_id);
    try {
        let products = [];
        const user = await User.findById(_id);

        const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
        if (alreadyExistCart) {
            alreadyExistCart.remove();
        }

        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id)
                .select("price")
                .exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal += products[i].price * products[i].count;
        }

        let newCart = await new Cart({
            products,
            cartTotal,
            orderBy: user?._id,
        }).save();

        res.status(200).json({
            status: "success",
            data: newCart,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const cart = await Cart.findOne({ orderBy: _id }).populate(
            "products.product"
        );

        res.status(200).json({
            status: "success",
            data: cart,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const user = await User.findById(_id);
        const cart = await Cart.findByIdAndRemove({ orderBy: user._id });

        res.status(201).json({
            status: "success",
            message: "Removed cart",
        });
    } catch (error) {
        throw new Error(error);
    }
});

const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
        throw new Error("Invalid Coupon");
    }

    const user = await User.findOne({ _id });
    let { products, cartTotal } = await Cart.findOne({
        orderBy: user._id,
    }).populate("products.product");
    let totalAfterDiscount = (
        cartTotal -
        (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);
    await Cart.findOneAndUpdate(
        { orderBy: user._id },
        { totalAfterDiscount },
        { new: true }
    );

    res.status(200).json({
        status: "success",
        data: totalAfterDiscount,
    });
});

const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        if (!COD) throw new Error("Create cash order failed");
        const user = await User.findById(_id);
        let userCart = await Cart.findOneAndDelete({ orderBy: user._id });
        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount * 100;
        } else {
            finalAmount = userCart.cartTotal * 100;
        }

        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "usd",
            },
            orderBy: user._id,
            orderStatus: "Cash on Delivery",
        }).save();

        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: {
                        $inc: { quantity: -item.count, sold: +item.count },
                    },
                },
            };
        });

        const updated = await Product.bulkWrite(update, {});

        res.status(200).json({
            status: "success",
            message: "Done Order",
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("products.product")
            .populate("orderBy")
            .exec();

        res.status(200).json({
            status: "success",
            data: orders,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getOrderByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    validateMongoDbId(userId);

    try {
        const user = await User.findById(userId);
        const order = await Order.find({ orderBy: userId })
            .populate("products.product")
            .populate("orderBy")
            .exec();

        res.status(200).json({
            status: "success",
            data: order,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    validateMongoDbId(id);

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
                paymentIntent: {
                    status,
                },
            },
            {
                new: true,
            }
        );

        res.status(200).json({
            status: "success",
            data: updatedOrder,
        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    getAllUsers,
    getUser,
    deleteUser,
    updateUser,
    getWishList,
    updateAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getAllOrders,
    getOrderByUserId,
    updateOrderStatus,
};
