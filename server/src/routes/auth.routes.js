// server/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { register, verifyOtp, login, getMe } = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/verifyToken");

// POST /api/v1/auth/register  — Đăng ký tài khoản + gửi OTP
router.post("/register", register);

// POST /api/v1/auth/verify-otp — Xác thực mã OTP
router.post("/verify-otp", verifyOtp);

// POST /api/v1/auth/login — Đăng nhập
router.post("/login", login);

// GET /api/v1/auth/me — Lấy thông tin user hiện tại
router.get("/me", verifyToken, getMe);

module.exports = router;
