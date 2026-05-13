// server/src/services/admin.service.js
const Shop = require("../models/Shop");
const User = require("../models/User");

/**
 * Lấy danh sách shop (có lọc theo trạng thái).
 * @param {string} [status] - Trạng thái cần lọc (pending, active, rejected, banned)
 * @returns {Promise<Array>} Mảng shop documents (populated owner)
 */
const getShops = async (status) => {
  const filter = {};
  if (status) filter.status = status;

  const shops = await Shop.find(filter)
    .populate("owner", "fullName email phone")
    .sort({ createdAt: -1 });

  return shops;
};

/**
 * Phê duyệt shop + cấp quyền merchant cho user chủ shop.
 * @param {string} shopId - ID của shop cần duyệt
 * @param {string} adminId - ID của admin thực hiện
 * @returns {Promise<void>}
 */
const approveShop = async (shopId, adminId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    const error = new Error("Không tìm thấy shop");
    error.statusCode = 404;
    throw error;
  }

  if (shop.status === "active") {
    const error = new Error("Shop đã được phê duyệt trước đó");
    error.statusCode = 400;
    throw error;
  }

  // Cập nhật trạng thái Shop
  shop.status = "active";
  shop.approvedAt = new Date();
  shop.approvedBy = adminId;
  await shop.save();

  // Cập nhật Role cho User chủ shop
  const user = await User.findById(shop.owner);
  if (user && !user.roles.includes("merchant")) {
    user.roles.push("merchant");
    await user.save();
  }
};

/**
 * Từ chối shop với lý do cụ thể.
 * @param {string} shopId - ID của shop cần từ chối
 * @param {string} rejectionReason - Lý do từ chối
 * @returns {Promise<void>}
 */
const rejectShop = async (shopId, rejectionReason) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    const error = new Error("Không tìm thấy shop");
    error.statusCode = 404;
    throw error;
  }

  shop.status = "rejected";
  shop.rejectionReason = rejectionReason;
  await shop.save();
};

module.exports = {
  getShops,
  approveShop,
  rejectShop,
};
