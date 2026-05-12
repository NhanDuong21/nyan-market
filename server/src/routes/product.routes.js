// server/src/routes/product.routes.js
const express = require("express");
const router = express.Router();
const { createProduct } = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");

// POST /api/v1/products — Đăng sản phẩm mới
// Quyền: Phải đăng nhập và có role merchant
router.post(
  "/",
  authenticate,
  authorize(["merchant"]),
  upload.array("images", 9),
  createProduct
);

module.exports = router;
