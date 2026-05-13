// server/src/controllers/auth.controller.js
const authService = require("../services/auth.service");

// ===== 1. REGISTER =====
// POST /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu",
      });
    }

    const result = await authService.registerUser({ fullName, email, password });

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.",
      data: result,
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code,
      message: error.message || "Đã xảy ra lỗi server. Vui lòng thử lại.",
    });
  }
};

// ===== 2. VERIFY OTP =====
// POST /api/v1/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email và mã OTP",
      });
    }

    await authService.verifyUserOTP({ email, otp });

    return res.status(200).json({
      success: true,
      message: "Xác thực email thành công. Bạn có thể đăng nhập ngay.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code,
      message: error.message || "Đã xảy ra lỗi server. Vui lòng thử lại.",
      ...(error.attemptsRemaining !== undefined && { attemptsRemaining: error.attemptsRemaining }),
      ...(error.retryAfter && { retryAfter: error.retryAfter }),
    });
  }
};

// ===== 3. LOGIN =====
// POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email và mật khẩu",
      });
    }

    const result = await authService.loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: result,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      code: error.code,
      message: error.message || "Đã xảy ra lỗi server. Vui lòng thử lại.",
      ...(error.reason && { reason: error.reason }),
    });
  }
};

// ===== 4. GET ME =====
// GET /api/v1/auth/me
const getMe = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin thành công",
      data: { user },
    });
  } catch (error) {
    console.error("Get Me Error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi server. Vui lòng thử lại.",
    });
  }
};

module.exports = {
  register,
  verifyOtp,
  login,
  getMe,
};
