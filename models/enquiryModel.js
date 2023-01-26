const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const enquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        mobile: {
            type: String,
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

//Export the model
module.exports = mongoose.model("Enquiry", enquirySchema);
