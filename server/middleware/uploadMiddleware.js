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
            return {
                folder: "learnhive",
                resource_type: "auto",   // was "image" — auto lets Cloudinary store
                                          // PDFs/DOCX as the correct type instead of
                                          // trying to treat them as an image, which
                                          // was breaking Google Docs Viewer previews
                public_id: Date.now() + "-" + file.originalname.replace(/\s+/g, "_").replace(/\.[^/.]+$/, ""),
                use_filename: true,
                unique_filename: false,
            };
        },
});

const upload = multer({ storage });

module.exports = upload;