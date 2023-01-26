const mongoose = require("mongoose");

const prodcategorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Category = mongoose.model("PCategory", prodcategorySchema);

module.exports = Category;
