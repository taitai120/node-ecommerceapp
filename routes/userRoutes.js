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
router.post("/logout", authController.logout);
router.get("/refresh", authController.handleRefreshToken);

router
    .route("/:id")
    .get(authMiddleware, isAdmin, userController.getUser)
    .delete(authMiddleware, isAdmin, userController.deleteUser);

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

module.exports = router;
