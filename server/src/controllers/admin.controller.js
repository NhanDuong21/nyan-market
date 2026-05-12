// server/src/controllers/admin.controller.js
const Shop = require("../models/Shop");
const User = require("../models/User");

/**
 * Lấy danh sách shop (có lọc theo trạng thái)
 * GET /api/v1/admin/shops?status=pending
 */
const getShops = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const shops = await Shop.find(filter)
      .populate("owner", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { shops },
    });
  } catch (error) {
    console.error("Admin Get Shops Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server",
    });
  }
};

/**
 * Phê duyệt Shop
 * PATCH /api/v1/admin/shops/:id/approve
 */
const approveShop = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const shop = await Shop.findById(id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy shop",
      });
    }

    if (shop.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Shop đã được phê duyệt trước đó",
      });
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

    return res.status(200).json({
      success: true,
      message: "Phê duyệt shop thành công. Người dùng hiện đã có quyền Người bán.",
    });
  } catch (error) {
    console.error("Admin Approve Shop Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server",
    });
  }
};

/**
 * Từ chối Shop
 * PATCH /api/v1/admin/shops/:id/reject
 */
const rejectShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp lý do từ chối",
      });
    }

    const shop = await Shop.findById(id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy shop",
      });
    }

    shop.status = "rejected";
    shop.rejectionReason = rejectionReason;
    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Đã từ chối yêu cầu mở shop",
    });
  } catch (error) {
    console.error("Admin Reject Shop Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server",
    });
  }
};

module.exports = {
  getShops,
  approveShop,
  rejectShop,
};
