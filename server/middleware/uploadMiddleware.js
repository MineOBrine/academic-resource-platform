const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
        params: async (req, file) => {
        const isPDF = file.mimetype === 'application/pdf';
        return {
            folder: "learnhive",
            resource_type: isPDF ? "raw" : "auto",
            public_id: Date.now() + "-" + file.originalname.replace(/\s+/g, "_"),
        };
    },
});

const upload = multer({ storage });

module.exports = upload;