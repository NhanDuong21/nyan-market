// server/src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ===== EMBEDDED: Address Schema =====
// Lý do Embed: Mỗi user tối đa ~10 địa chỉ, luôn đọc cùng user khi checkout.
// Kích thước nhỏ, cố định — không cần tách collection.
const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true, // "Nhà", "Công ty"
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    ward: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// ===== MAIN: User Schema =====
const userSchema = new mongoose.Schema(
  {
    // --- Thông tin cá nhân ---
    fullName: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
      trim: true,
      maxlength: [100, "Họ tên tối đa 100 ký tự"],
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Email không hợp lệ",
      ],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // Cho phép null nhưng unique khi có giá trị
      match: [/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ"],
    },
    avatar: {
      type: String, // Cloudinary URL
      default: null,
    },

    // --- Xác thực ---
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [8, "Mật khẩu tối thiểu 8 ký tự"],
      select: false, // Không trả về khi query mặc định
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    socialId: {
      type: String, // Google/Facebook ID
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // --- Phân quyền ---
    roles: {
      type: [String],
      enum: {
        values: ["user", "merchant", "admin"],
        message: "Role {VALUE} không hợp lệ",
      },
      default: ["user"],
    },
    status: {
      type: String,
      enum: ["active", "banned", "inactive"],
      default: "active",
    },
    banReason: {
      type: String,
      default: null,
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // --- Embedded: Địa chỉ giao hàng ---
    addresses: {
      type: [addressSchema],
      default: [],
      validate: [
        (arr) => arr.length <= 10,
        "Tối đa 10 địa chỉ giao hàng",
      ],
    },

    // --- Embedded: OTP (dữ liệu tạm thời, chỉ thuộc 1 user) ---
    otp: {
      code: {
        type: String,
        select: false,
      },
      expiresAt: {
        type: Date,
      },
      attempts: {
        type: Number,
        default: 0, // Đếm số lần nhập sai
      },
      sentCount: {
        type: Number,
        default: 0, // Đếm số lần gửi (rate limit)
      },
      blockedUntil: {
        type: Date,
        default: null,
      },
    },

    // --- Token ---
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: "__v", // Optimistic locking
  }
);

// ===== INDEXES =====
// email index is auto-created by unique: true on the field
userSchema.index({ status: 1, roles: 1 });

// ===== HOOKS =====

// Pre-save: Hash password trước khi lưu vào DB
userSchema.pre("save", async function () {
  // Chỉ hash khi password bị thay đổi (tạo mới hoặc cập nhật)
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ===== INSTANCE METHODS =====

// So sánh password khi đăng nhập
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Trả về user object không chứa dữ liệu nhạy cảm
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.otp;
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
