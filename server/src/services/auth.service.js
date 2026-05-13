// server/src/services/auth.service.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("./email.service");

// ===== HELPERS =====

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );
};

// ===== SERVICE FUNCTIONS =====

/**
 * Đăng ký tài khoản mới + gửi OTP qua email.
 * @throws Error với message cụ thể nếu thất bại
 */
const registerUser = async ({ fullName, email, password }) => {
  // Kiểm tra email đã tồn tại
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error("Email đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.");
    error.statusCode = 409;
    error.code = "EMAIL_ALREADY_EXISTS";
    throw error;
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

  return {
    email: user.email,
    otpExpiresAt,
  };
};

/**
 * Xác thực mã OTP cho user.
 * @throws Error với code cụ thể (OTP_BLOCKED, OTP_EXPIRED, OTP_INVALID)
 */
const verifyUserOTP = async ({ email, otp }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+otp.code");

  if (!user) {
    const error = new Error("Email không tồn tại trong hệ thống");
    error.statusCode = 400;
    throw error;
  }

  if (user.isEmailVerified) {
    const error = new Error("Email đã được xác thực trước đó");
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra bị block
  if (user.otp.blockedUntil && user.otp.blockedUntil > new Date()) {
    const error = new Error("Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.");
    error.statusCode = 403;
    error.code = "OTP_BLOCKED";
    error.retryAfter = user.otp.blockedUntil;
    throw error;
  }

  // Kiểm tra hết hạn
  if (!user.otp.expiresAt || user.otp.expiresAt < new Date()) {
    const error = new Error("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.");
    error.statusCode = 400;
    error.code = "OTP_EXPIRED";
    throw error;
  }

  // Kiểm tra OTP sai
  if (user.otp.code !== otp) {
    user.otp.attempts += 1;
    if (user.otp.attempts >= 5) {
      user.otp.blockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await user.save({ validateModifiedOnly: true });

    const error = new Error("Mã OTP không chính xác");
    error.statusCode = 400;
    error.code = "OTP_INVALID";
    error.attemptsRemaining = Math.max(0, 5 - user.otp.attempts);
    throw error;
  }

  // OTP đúng → xác thực thành công
  user.isEmailVerified = true;
  user.otp = {
    code: undefined,
    expiresAt: undefined,
    attempts: 0,
    sentCount: 0,
    blockedUntil: null,
  };
  await user.save({ validateModifiedOnly: true });
};

/**
 * Đăng nhập: kiểm tra credentials, trả về token + user info.
 * @returns {{ accessToken: string, user: Object }}
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    const error = new Error("Email hoặc mật khẩu không đúng");
    error.statusCode = 401;
    throw error;
  }

  if (user.status === "banned") {
    const error = new Error("Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.");
    error.statusCode = 403;
    error.reason = user.banReason;
    throw error;
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    const error = new Error("Email hoặc mật khẩu không đúng");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isEmailVerified) {
    const error = new Error("Vui lòng xác thực email trước khi đăng nhập");
    error.statusCode = 401;
    error.code = "EMAIL_NOT_VERIFIED";
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const safeUser = user.toSafeObject();

  return { accessToken, user: safeUser };
};

/**
 * Lấy thông tin user theo ID (cho endpoint /me).
 * @returns {Object} Safe user object
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("Không tìm thấy thông tin người dùng");
    error.statusCode = 404;
    throw error;
  }
  return user.toSafeObject();
};

module.exports = {
  registerUser,
  verifyUserOTP,
  loginUser,
  getUserById,
};
