// server/src/controllers/product.controller.js
const productService = require("../services/product.service");
const { rollbackUploads } = require("../utils/cloudinary.utils");

/**
 * Tạo sản phẩm mới
 * POST /api/v1/products
 */
const createProduct = async (req, res) => {
  try {
    const newProduct = await productService.createProduct(req.user.id, req.body, req.files);

    return res.status(201).json({
      success: true,
      message: "Đăng sản phẩm thành công!",
      data: { product: newProduct },
    });
  } catch (error) {
    console.error("Create Product Error:", error.message);

    // Rollback Cloudinary uploads nếu DB lưu thất bại
    if (req.files && req.files.length > 0) {
      await rollbackUploads(req.files);
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi server khi đăng sản phẩm",
    });
  }
};

/**
 * Lấy danh sách sản phẩm (Công khai cho trang chủ)
 * GET /api/v1/products
 */
const getProducts = async (req, res) => {
  try {
    const result = await productService.getPublicProducts(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get Products Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server",
    });
  }
};

/**
 * Lấy danh sách sản phẩm của tôi (Dành cho người bán)
 * GET /api/v1/products/my-products
 */
const getMerchantProducts = async (req, res) => {
  try {
    const products = await productService.getMerchantProducts(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      data: { products },
    });
  } catch (error) {
    console.error("Get Merchant Products Error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi server khi lấy danh sách sản phẩm",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getMerchantProducts,
};
