// server/src/controllers/product.controller.js
const Product = require("../models/Product");
const Shop = require("../models/Shop");
const cloudinary = require("../config/cloudinary");

/**
 * Tạo sản phẩm mới
 * POST /api/v1/products
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, stock, category, tags } = req.body;
    const userId = req.user.id;

    // 1. Tìm Shop của user này
    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền đăng sản phẩm vì chưa có Shop",
      });
    }

    if (shop.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Shop của bạn đang chờ duyệt hoặc bị khóa, không thể đăng sản phẩm",
      });
    }

    // 2. Lấy danh sách ảnh đã upload
    const images = req.files ? req.files.map((file) => file.path) : [];
    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm phải có ít nhất 1 hình ảnh",
      });
    }

    // 3. Tạo slug
    const generateSlug = (text) => {
      return text
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let slugCounter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

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

    return res.status(201).json({
      success: true,
      message: "Đăng sản phẩm thành công!",
      data: { product: newProduct },
    });

  } catch (error) {
    console.error("Create Product Error:", error.message);

    // Rollback: Xóa ảnh trên Cloudinary nếu lưu DB thất bại
    if (req.files && req.files.length > 0) {
      const deletePromises = req.files.map((file) => 
        cloudinary.uploader.destroy(file.filename).catch(console.error)
      );
      await Promise.all(deletePromises);
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server khi đăng sản phẩm",
    });
  }
};

/**
 * Lấy danh sách sản phẩm (Công khai cho trang chủ)
 * GET /api/v1/products
 */
const getProducts = async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    const filter = { status: "active" };
    
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .populate("shop", "shopName slug")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: { 
        products,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      },
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
    const userId = req.user.id;

    // 1. Tìm Shop của user này
    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin Shop của bạn",
      });
    }

    // 2. Lấy danh sách sản phẩm thuộc Shop này
    const products = await Product.find({ shop: shop._id })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      data: { products },
    });
  } catch (error) {
    console.error("Get Merchant Products Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server khi lấy danh sách sản phẩm",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getMerchantProducts,
};
