const mongoose = require("mongoose");

const dbConnect = () => {
    try {
        const conn = mongoose.connect(
            process.env.DB.replace("<password>", process.env.DB_PASSWORD)
        );
        console.log("Database Connected");
    } catch (error) {
        console.log("DB ERROR: ", error);
    }
};

module.exports = dbConnect;
