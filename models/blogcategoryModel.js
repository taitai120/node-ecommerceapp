const mongoose = require("mongoose");

const blogcategorySchema = new mongoose.Schema(
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

const Category = mongoose.model("BCategory", blogcategorySchema);

module.exports = Category;
