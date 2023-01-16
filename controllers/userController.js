const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../config/jwtToken");

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

module.exports = {
    getAllUsers,
    getUser,
    deleteUser,
    updateUser,
};
