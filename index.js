const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const dbConnect = require("./config/dbConnect");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const blogRoutes = require("./routes/blogRoutes");
const prodcategoryRoutes = require("./routes/prodcategoryRoutes");
const blogcategoryRoutes = require("./routes/blogcategoryRoutes");
const couponRoutes = require("./routes/couponRoutes");
const brandRoutes = require("./routes/brandRoutes");
const colorRoutes = require("./routes/colorRoutes");
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/categories", prodcategoryRoutes);
app.use("/api/v1/blogcategories", blogcategoryRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/colors", colorRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(8000, () => {
    dbConnect();
    console.log("SERVER ONLINE");
});
