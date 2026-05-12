// server/src/middlewares/upload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nyan-market/kyc",
    allowed_formats: ["jpg", "jpeg", "png"],
    // transformation: [{ width: 1000, crop: "limit" }], // Optional resize
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

module.exports = upload;
