// server/src/controllers/category.controller.js
const Category = require("../models/Category");

/**
 * Lấy danh sách tất cả danh mục đang hoạt động
 * GET /api/v1/categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    return res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("Get Categories Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server",
    });
  }
};

module.exports = {
  getCategories,
};
