// server/src/controllers/shop.controller.js
const shopService = require("../services/shop.service");
const { rollbackFieldUploads } = require("../utils/cloudinary.utils");

// POST /api/v1/shops/register
// Đăng ký mở quán (Merchant Onboarding)
const registerShop = async (req, res) => {
  try {
    const newShop = await shopService.createShop(req.user.id, req.body, req.files);

    return res.status(201).json({
      success: true,
      message: "Đăng ký mở quán thành công. Vui lòng chờ Admin phê duyệt.",
      data: { shop: newShop },
    });
  } catch (error) {
    console.error("Register Shop Error:", error.message);

    // Rollback Cloudinary uploads nếu DB lưu thất bại
    await rollbackFieldUploads(req.files, ["idCardFront", "idCardBack"]);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi server. Vui lòng thử lại.",
    });
  }
};

// GET /api/v1/shops/my-shop
// Lấy thông tin shop của user hiện tại
const getMyShop = async (req, res) => {
  try {
    const shop = await shopService.getShopByOwnerId(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: "Chưa đăng ký shop" });
    }
    
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin shop thành công",
      data: { shop },
    });
  } catch (error) {
    console.error("Get My Shop Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server. Vui lòng thử lại.",
    });
  }
};

module.exports = {
  registerShop,
  getMyShop,
};
