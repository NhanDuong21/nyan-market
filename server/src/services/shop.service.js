// server/src/services/shop.service.js
const Shop = require("../models/Shop");
const { generateUniqueSlug } = require("../utils/slug");

/**
 * Đăng ký mở shop mới.
 * @param {string} userId - ID của user đăng ký
 * @param {Object} shopData - Dữ liệu shop từ request body
 * @param {Object} files - req.files từ multer.fields()
 * @returns {Promise<Object>} Shop document đã tạo
 */
const createShop = async (userId, shopData, files) => {
  const { shopName, description, phone, address, categories, categoryIds } = shopData;

  // 1. Kiểm tra User đã có shop chưa
  const existingShopOwner = await Shop.findOne({ owner: userId });
  if (existingShopOwner) {
    const error = new Error("Bạn đã đăng ký mở quán rồi. Vui lòng kiểm tra trạng thái duyệt.");
    error.statusCode = 409;
    throw error;
  }

  // 2. Parse address (có thể là string từ FormData)
  let parsedAddress;
  try {
    parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
  } catch (err) {
    const error = new Error("Định dạng địa chỉ không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  // 3. Validate input
  if (!shopName || !phone || !parsedAddress ||
      !parsedAddress.province || !parsedAddress.district ||
      !parsedAddress.ward || !parsedAddress.street) {
    const error = new Error("Vui lòng điền đầy đủ thông tin bắt buộc (Tên quán, SĐT, Địa chỉ)");
    error.statusCode = 400;
    throw error;
  }

  // 4. Kiểm tra tên shop trùng
  const existingShopName = await Shop.findOne({ shopName: new RegExp(`^${shopName}$`, "i") });
  if (existingShopName) {
    const error = new Error("Tên quán đã được sử dụng. Vui lòng chọn tên khác.");
    error.statusCode = 409;
    throw error;
  }

  // 5. Lấy URLs từ file upload
  let idCardFrontUrl = "";
  let idCardBackUrl = "";
  if (files) {
    if (files.idCardFront && files.idCardFront.length > 0) {
      idCardFrontUrl = files.idCardFront[0].path;
    }
    if (files.idCardBack && files.idCardBack.length > 0) {
      idCardBackUrl = files.idCardBack[0].path;
    }
  }

  // 6. Tạo slug duy nhất
  const slug = await generateUniqueSlug(shopName, Shop);

  // 7. Parse categories
  let parsedCategories = [];
  try {
    const rawCategories = categoryIds || categories;
    parsedCategories = typeof rawCategories === "string"
      ? JSON.parse(rawCategories)
      : (rawCategories || []);
  } catch (e) { /* ignore parse error */ }

  // 8. Tạo shop
  const newShop = await Shop.create({
    owner: userId,
    shopName,
    slug,
    description: description || "",
    phone,
    address: parsedAddress,
    categories: parsedCategories,
    kyc: {
      idCardFront: idCardFrontUrl,
      idCardBack: idCardBackUrl,
      submittedAt: new Date(),
    },
  });

  return newShop;
};

module.exports = { createShop };
