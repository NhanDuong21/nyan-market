// server/src/models/Category.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      trim: true,
      unique: true,
      maxlength: [50, "Tên danh mục tối đa 50 ký tự"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String, // Cloudinary URL
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
