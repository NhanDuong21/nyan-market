// server/src/services/product.service.js
const Product = require("../models/Product");
const Shop = require("../models/Shop");
const Category = require("../models/Category");
const { generateUniqueSlug } = require("../utils/slug");

/**
 * Tạo sản phẩm mới cho một merchant.
 * @param {string} userId - ID của user (merchant)
 * @param {Object} productData - Dữ liệu sản phẩm từ request body
 * @param {Array} imageFiles - Mảng file ảnh đã upload (từ multer)
 * @returns {Promise<Object>} Product document đã tạo
 */
const createProduct = async (userId, productData, imageFiles) => {
  const { name, description, price, originalPrice, stock, category, tags } = productData;

  // 1. Tìm Shop của user
  const shop = await Shop.findOne({ owner: userId });
  if (!shop) {
    const error = new Error("Bạn không có quyền đăng sản phẩm vì chưa có Shop");
    error.statusCode = 403;
    throw error;
  }

  if (shop.status !== "active") {
    const error = new Error("Shop của bạn đang chờ duyệt hoặc bị khóa, không thể đăng sản phẩm");
    error.statusCode = 403;
    throw error;
  }

  // 2. Lấy danh sách ảnh
  const images = imageFiles ? imageFiles.map((file) => file.path) : [];
  if (images.length === 0) {
    const error = new Error("Sản phẩm phải có ít nhất 1 hình ảnh");
    error.statusCode = 400;
    throw error;
  }

  // 3. Tạo slug duy nhất
  const slug = await generateUniqueSlug(name, Product);

  // 4. Lưu sản phẩm
  const newProduct = await Product.create({
    shop: shop._id,
    name,
    slug,
    description,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : null,
    stock: Number(stock),
    category,
    images,
    tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
  });

  return newProduct;
};

/**
 * Lấy danh sách sản phẩm công khai (cho trang chủ).
 * @param {Object} queryParams - { category, limit, page }
 * @returns {Promise<{ products: Array, pagination: Object }>}
 */
const getPublicProducts = async ({ category, limit = 20, page = 1 }) => {
  const filter = { status: "active" };
  if (category) filter.category = category;

  const numLimit = Number(limit);
  const numPage = Number(page);

  const products = await Product.find(filter)
    .populate("shop", "shopName slug")
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(numLimit)
    .skip((numPage - 1) * numLimit);

  const total = await Product.countDocuments(filter);

  return {
    products,
    pagination: {
      total,
      page: numPage,
      limit: numLimit,
      pages: Math.ceil(total / numLimit),
    },
  };
};

/**
 * Lấy danh sách sản phẩm của merchant hiện tại.
 * @param {string} userId - ID của user (merchant)
 * @returns {Promise<Array>} Mảng product documents
 */
const getMerchantProducts = async (userId) => {
  const shop = await Shop.findOne({ owner: userId });
  if (!shop) {
    const error = new Error("Không tìm thấy thông tin Shop của bạn");
    error.statusCode = 404;
    throw error;
  }

  const products = await Product.find({ shop: shop._id })
    .populate("category", "name")
    .sort({ createdAt: -1 });

  return products;
};

module.exports = {
  createProduct,
  getPublicProducts,
  getMerchantProducts,
};
