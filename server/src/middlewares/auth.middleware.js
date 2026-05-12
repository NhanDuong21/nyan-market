// server/src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

/**
 * Middleware xác thực người dùng dựa trên JWT
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập hoặc token không hợp lệ",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại",
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};

/**
 * Middleware phân quyền dựa trên roles
 * @param {string[]} roles - Danh sách các role được phép truy cập
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để thực hiện hành động này",
      });
    }

    const hasRole = roles.some((role) => req.user.roles && req.user.roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập chức năng này",
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
