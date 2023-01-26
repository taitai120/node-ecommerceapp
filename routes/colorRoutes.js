const express = require("express");
const router = express.Router();
const colorController = require("../controllers/colorController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", colorController.getAllColors);
router.post("/", authMiddleware, isAdmin, colorController.createColor);

router
    .route("/:id")
    .get(colorController.getColorById)
    .put(authMiddleware, isAdmin, colorController.updateColor)
    .delete(authMiddleware, isAdmin, colorController.deleteColor);

module.exports = router;
