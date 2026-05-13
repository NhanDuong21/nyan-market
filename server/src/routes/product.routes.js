// server/src/routes/product.routes.js
const express = require("express");
const router = express.Router();
const { createProduct, getProducts, getMerchantProducts } = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

// GET /api/v1/products — Lấy danh sách sản phẩm công khai
router.get("/", getProducts);

// GET /api/v1/products/my-products — Lấy sản phẩm của shop hiện tại
router.get("/my-products", authenticate, authorize(["merchant"]), getMerchantProducts);

// POST /api/v1/products — Đăng sản phẩm mới
// Quyền: Phải đăng nhập và có role merchant hoặc admin
router.post(
  "/",
  authenticate,
  authorize(["merchant", "admin"]),
  upload.array("images", 9),
  createProduct
);

// PUT /api/v1/products/:id — Cập nhật sản phẩm (future)
router.put(
  "/:id",
  authenticate,
  authorize(["merchant", "admin"]),
  (req, res) => res.status(501).json({ message: "Not Implemented" })
);

// DELETE /api/v1/products/:id — Xóa sản phẩm (future)
router.delete(
  "/:id",
  authenticate,
  authorize(["merchant", "admin"]),
  (req, res) => res.status(501).json({ message: "Not Implemented" })
);

module.exports = router;
