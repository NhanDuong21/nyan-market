// server/src/models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    // === SHOP (Reference) ===
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    // === THÔNG TIN SẢN PHẨM ===
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      trim: true,
      maxlength: [200, "Tên sản phẩm tối đa 200 ký tự"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Mô tả sản phẩm là bắt buộc"],
      maxlength: [10000, "Mô tả tối đa 10000 ký tự"],
    },
    images: {
      type: [String], // Cloudinary URLs
      validate: [
        {
          validator: (arr) => arr.length >= 1 && arr.length <= 9,
          message: "Sản phẩm phải có từ 1 đến 9 ảnh",
        },
      ],
    },
    video: {
      type: String,
      default: null,
    },

    // === PHÂN LOẠI ===
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Danh mục là bắt buộc"],
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    // === GIÁ & TỒN KHO ===
    price: {
      type: Number,
      required: [true, "Giá sản phẩm là bắt buộc"],
      min: [0, "Giá không được âm"],
    },
    originalPrice: {
      type: Number,
      default: null,
      min: [0, "Giá không được âm"],
    },
    stock: {
      type: Number,
      required: [true, "Số lượng tồn kho là bắt buộc"],
      min: [0, "Tồn kho không được âm"],
      default: 0,
    },

    // === TRẠNG THÁI & THỐNG KÊ ===
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock", "hidden"],
      default: "active",
    },
    stats: {
      totalSold: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      viewCount: { type: Number, default: 0 },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for performance
ProductSchema.index({ shop: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: "text" }); // Text search support

module.exports = mongoose.model("Product", ProductSchema);
