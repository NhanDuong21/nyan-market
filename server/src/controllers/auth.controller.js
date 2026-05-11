// server/src/controllers/auth.controller.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("../services/email.service");

// ===== HELPER: Sinh OTP 6 số =====
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ===== HELPER: Sinh Access Token =====
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );
};

// ===== 1. REGISTER =====
// POST /api/v1/auth/register
// Body: { fullName, email, password }
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu",
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: "EMAIL_ALREADY_EXISTS",
        message: "Email đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.",
      });
    }

    // Sinh OTP 6 số, hạn 5 phút
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Tạo user mới (password sẽ được hash bởi pre-save hook)
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      isEmailVerified: false,
      otp: {
        code: otpCode,
        expiresAt: otpExpiresAt,
        attempts: 0,
        sentCount: 1,
      },
    });

    // Gửi email OTP
    await sendVerificationEmail(user.email, otpCode);

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.",
      data: {
        email: user.email,
        otpExpiresAt,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    // Xử lý lỗi validation từ Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server. Vui lòng thử lại.",
    });
  }
};

// ===== 2. VERIFY OTP =====
// POST /api/v1/auth/verify-otp
// Body: { email, otp }
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email và mã OTP",
      });
    }

    // Tìm user kèm trường otp.code (select: false)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+otp.code");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email không tồn tại trong hệ thống",
      });
    }

    // Kiểm tra đã verify rồi chưa
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email đã được xác thực trước đó",
      });
    }

    // Kiểm tra bị block (nhập sai quá 5 lần)
    if (user.otp.blockedUntil && user.otp.blockedUntil > new Date()) {
      return res.status(403).json({
        success: false,
        code: "OTP_BLOCKED",
        message: "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.",
        retryAfter: user.otp.blockedUntil,
      });
    }

    // Kiểm tra OTP hết hạn (5 phút)
    if (!user.otp.expiresAt || user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        code: "OTP_EXPIRED",
        message: "Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.",
      });
    }

    // Kiểm tra OTP đúng hay sai
    if (user.otp.code !== otp) {
      // Tăng số lần nhập sai
      user.otp.attempts += 1;

      // Block sau 5 lần sai → khóa 30 phút
      if (user.otp.attempts >= 5) {
        user.otp.blockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await user.save({ validateModifiedOnly: true });

      return res.status(400).json({
        success: false,
        code: "OTP_INVALID",
        message: "Mã OTP không chính xác",
        attemptsRemaining: Math.max(0, 5 - user.otp.attempts),
      });
    }

    // OTP đúng → Xác thực thành công
    user.isEmailVerified = true;
    // Dọn dẹp object otp
    user.otp = {
      code: undefined,
      expiresAt: undefined,
      attempts: 0,
      sentCount: 0,
      blockedUntil: null,
    };

    await user.save({ validateModifiedOnly: true });

    return res.status(200).json({
      success: true,
      message: "Xác thực email thành công. Bạn có thể đăng nhập ngay.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server. Vui lòng thử lại.",
    });
  }
};

// ===== 3. LOGIN =====
// POST /api/v1/auth/login
// Body: { email, password }
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email và mật khẩu",
      });
    }

    // Tìm user kèm trường password (select: false)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password");

    // Thông báo lỗi chung để tránh dò quét tài khoản
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra tài khoản bị ban
    if (user.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.",
        reason: user.banReason,
      });
    }

    // So sánh password (bcrypt)
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra đã xác thực email chưa
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Vui lòng xác thực email trước khi đăng nhập",
      });
    }

    // Sinh access token
    const accessToken = generateAccessToken(user);

    // Trả về thông tin user an toàn (không chứa password, otp, refreshToken)
    const safeUser = user.toSafeObject();

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        accessToken,
        user: safeUser,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server. Vui lòng thử lại.",
    });
  }
};

module.exports = {
  register,
  verifyOtp,
  login,
};
