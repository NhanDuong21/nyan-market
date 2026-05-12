// server/src/scripts/seedCategories.js
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");

const categories = [
  { name: "Thời Trang Nam", slug: "thoi-trang-nam" },
  { name: "Thời Trang Nữ", slug: "thoi-trang-nu" },
  { name: "Điện Thoại & Phụ Kiện", slug: "dien-thoai-phu-kien" },
  { name: "Máy Tính & Laptop", slug: "may-tinh-laptop" },
  { name: "Điện Gia Dụng", slug: "dien-gia-dung" },
  { name: "Sức Khỏe & Sắc Đẹp", slug: "suc-khoe-sac-dep" },
  { name: "Giày Dép Nam", slug: "giay-dep-nam" },
  { name: "Giày Dép Nữ", slug: "giay-dep-nu" },
  { name: "Đồng Hồ", slug: "dong-ho" },
  { name: "Túi Ví Nữ", slug: "tui-vi-nu" },
  { name: "Thiết Bị Điện Tử", slug: "thiet-bi-dien-tu" },
  { name: "Bách Hóa Online", slug: "bach-hoa-online" },
  { name: "Nhà Cửa & Đời Sống", slug: "nha-cua-doi-song" },
  { name: "Mẹ & Bé", slug: "me-be" },
  { name: "Đồ Chơi", slug: "do-choi" },
  { name: "Giặt Giũ & Chăm Sóc Nhà Cửa", slug: "giat-giu-cham-soc-nha-cua" },
  { name: "Chăm Sóc Thú Cưng", slug: "cham-soc-thu-cung" },
  { name: "Voucher & Dịch Vụ", slug: "voucher-dich-vu" },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding categories...");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories.");

    // Insert new categories
    await Category.insertMany(categories);
    console.log("Categories seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
