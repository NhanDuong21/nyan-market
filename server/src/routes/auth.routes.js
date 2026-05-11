// server/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { register, verifyOtp, login } = require("../controllers/auth.controller");

// POST /api/v1/auth/register  — Đăng ký tài khoản + gửi OTP
router.post("/register", register);

// POST /api/v1/auth/verify-otp — Xác thực mã OTP
router.post("/verify-otp", verifyOtp);

// POST /api/v1/auth/login — Đăng nhập
router.post("/login", login);

module.exports = router;
