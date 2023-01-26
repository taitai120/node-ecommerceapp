const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const {
    authMiddleware,
    isAdmin,
    isMatchUser,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", userController.getAllUsers);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/admin-login", authController.loginAdmin);
router.post("/logout", authController.logout);
router.get("/refresh", authController.handleRefreshToken);
router.get("/wishlist", authMiddleware, userController.getWishList);
router.put("/update-address", authMiddleware, userController.updateAddress);

router
    .route("/cart")
    .get(authMiddleware, userController.getUserCart)
    .post(authMiddleware, userController.userCart)
    .delete(authMiddleware, userController.emptyCart);

router.post("/cart/applycoupon", authMiddleware, userController.applyCoupon);
router.post("/cart/cash-order", authMiddleware, userController.createOrder);

router.get("/orders/get-orders", authMiddleware, userController.getAllOrders);
router.get(
    "/orders/get-orders/:userId",
    authMiddleware,
    userController.getOrderByUserId
);
router.put(
    "/orders/update-order/:id",
    authMiddleware,
    userController.updateOrderStatus
);

router.put("/edit-user", authMiddleware, userController.updateUser);
router.put(
    "/block-user/:id",
    authMiddleware,
    isAdmin,
    authController.blockUser
);
router.put(
    "/unblock-user/:id",
    authMiddleware,
    isAdmin,
    authController.unBlockUser
);

router.post("/forgot-password-token", authController.forgotPasswordToken);
router.post("/reset-password/:token", authController.resetPassword);
router.put("/update-password", authMiddleware, authController.updatePassword);

router
    .route("/:id")
    .get(authMiddleware, isAdmin, userController.getUser)
    .delete(authMiddleware, isAdmin, userController.deleteUser);

module.exports = router;
