const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, isAdmin, couponController.getAllCoupons);
router.post("/", authMiddleware, isAdmin, couponController.createCoupon);

router
    .route("/:id")
    .get(couponController.getCouponById)
    .put(authMiddleware, isAdmin, couponController.updateCoupon)
    .delete(authMiddleware, isAdmin, couponController.deleteCoupon);

module.exports = router;
