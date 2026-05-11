// server/src/models/Shop.js
const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    // === CHỦ SỞ HỮU (Reference) ===
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 User = 1 Shop
    },

    // === THÔNG TIN SHOP ===
    shopName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true, // URL-friendly: /shop/nyan-fashion
    },
    description: {
      type: String,
      maxlength: 2000,
      default: "",
    },
    logo: { type: String, default: null }, // Cloudinary URL
    banner: { type: String, default: null },

    // === LIÊN HỆ & ĐỊA CHỈ ===
    phone: { type: String, required: true },
    address: {
      province: { type: String, required: true },
      district: { type: String, required: true },
      ward: { type: String, required: true },
      street: { type: String, required: true },
    },

    // === TRẠNG THÁI DUYỆT ===
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "banned"],
      default: "pending",
    },
    rejectionReason: { type: String, default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // === KYC (Embedded) ===
    kyc: {
      idCardFront: { type: String }, // Cloudinary URL
      idCardBack: { type: String },
      businessLicense: { type: String, default: null },
      storePhotos: { type: [String], default: [] },
      submittedAt: { type: Date },
      resubmitCount: { type: Number, default: 0 }, // Tối đa 3 lần
    },

    // === THỐNG KÊ (Denormalized) ===
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalSold: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      followerCount: { type: Number, default: 0 },
    },

    // === CẤU HÌNH ===
    commissionRate: {
      type: Number,
      default: 5, // 5% phí sàn mặc định
      min: 0,
      max: 100,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", // Sẽ tạo model Category sau
      },
    ],
  },
  { timestamps: true }
);

// ===== INDEXES =====
ShopSchema.index({ status: 1 });

module.exports = mongoose.model("Shop", ShopSchema);
