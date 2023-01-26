const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});

const cloudinaryUploadImg = async (fileToUploads) => {
    const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
    };

    try {
        const result = await cloudinary.uploader.upload(fileToUploads, options);
        return result.secure_url;
    } catch (error) {
        console.log(error);
    }
};

module.exports = cloudinaryUploadImg;
