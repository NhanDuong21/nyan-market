// server/src/controllers/admin.controller.js
const adminService = require("../services/admin.service");

/**
 * Lấy danh sách shop (có lọc theo trạng thái)
 * GET /api/v1/admin/shops?status=pending
 */
const getShops = async (req, res) => {
  try {
    const shops = await adminService.getShops(req.query.status);

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
    await adminService.approveShop(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Phê duyệt shop thành công. Người dùng hiện đã có quyền Người bán.",
    });
  } catch (error) {
    console.error("Admin Approve Shop Error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi server",
    });
  }
};

/**
 * Từ chối Shop
 * PATCH /api/v1/admin/shops/:id/reject
 */
const rejectShop = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp lý do từ chối",
      });
    }

    await adminService.rejectShop(req.params.id, rejectionReason);

    return res.status(200).json({
      success: true,
      message: "Đã từ chối yêu cầu mở shop",
    });
  } catch (error) {
    console.error("Admin Reject Shop Error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi server",
    });
  }
};

module.exports = {
  getShops,
  approveShop,
  rejectShop,
};
