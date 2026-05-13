// server/src/routes/shop.routes.js
const express = require("express");
const router = express.Router();
const { registerShop, getMyShop } = require("../controllers/shop.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

// GET /api/v1/shops/my-shop — Lấy thông tin shop của user hiện tại
// Chỉ cần authenticate (vì chưa có role merchant khi đang pending)
router.get("/my-shop", authenticate, getMyShop);

// POST /api/v1/shops/register — Đăng ký mở quán
// Yêu cầu xác thực (verifyToken) và xử lý upload file (upload.fields)
router.post(
  "/register", 
  authenticate, 
  upload.fields([
    { name: "idCardFront", maxCount: 1 },
    { name: "idCardBack", maxCount: 1 }
  ]),
  registerShop
);

module.exports = router;
