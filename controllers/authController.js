const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const validateMongoDbId = require("../utils/validateMongodbId");
const sendEmail = require("../controllers/emailController");
const crypto = require("crypto");

const register = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const findUser = await User.findOne({ email });

    if (!findUser) {
        const newUser = await User.create(req.body);
        res.status(200).json({
            status: "success",
            data: newUser,
        });
    } else {
        throw new Error("User already exists");
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // check if user exists or not
    const findUser = await User.findOne({ email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(
            findUser._id,
            {
                refreshToken,
            },
            { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.status(200).json({
            status: "success",
            data: {
                _id: findUser?._id,
                firstName: findUser?.firstName,
                lastName: findUser?.lastName,
                email: findUser?.email,
                mobile: findUser?.mobile,
                token: generateToken(findUser?._id),
            },
        });
    } else {
        throw new Error("Invalid Credientials");
    }
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        );

        res.status(200).json({
            status: "success",
            data: user,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const unBlockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            }
        );

        res.status(200).json({
            status: "success",
            data: user,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user)
        throw new Error("No refresh token presents in db or not matchs any.");
    jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(user?._id);

        res.status(200).json({
            status: "success",
            accessToken,
        });
    });
});

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204);
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });
    return res.sendStatus(204);
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");

    try {
        const token = await user.createPasswordResetToken();
        await user.save();

        const resetURL = `Hi, please follow this link to reset your password. This link is only valid for 10 minutes from now. <a href="http://localhost:8000/api/v1/users/reset-password/${token}">Click here</a>`;

        const data = {
            to: email,
            subject: "Forgot Password Link",
            text: "Hello my friend",
            html: resetURL,
        };
        sendEmail(data);

        res.status(200).json({
            status: "succes",
            message: "A token for reseting password has send to your email",
            token,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        throw new Error("Passwords must be the same");
    }

    // Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // If token is not expired and there is a user, set new password
    if (!user) {
        throw new Error("Token is expired, please try again later");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
        status: "success",
        message: "Password has changed successfully",
    });
});

const updatePassword = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        const { password } = req.body;

        validateMongoDbId(_id);

        const user = await User.findById(_id);
        if (password) {
            user.password = password;
            const updatedUser = await user.save();
            res.status(200).json({
                status: "success",
                data: updatedUser,
            });
        } else {
            res.status(200).json({
                status: "normal",
                data: user,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    register,
    login,
    blockUser,
    unBlockUser,
    handleRefreshToken,
    logout,
    forgotPasswordToken,
    resetPassword,
    updatePassword,
};
