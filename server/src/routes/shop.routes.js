// server/src/routes/shop.routes.js
const express = require("express");
const router = express.Router();
const { registerShop } = require("../controllers/shop.controller");
const verifyToken = require("../middlewares/verifyToken");

// POST /api/v1/shops/register — Đăng ký mở quán
// Yêu cầu xác thực (verifyToken)
router.post("/register", verifyToken, registerShop);

module.exports = router;
