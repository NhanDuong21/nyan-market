// server/src/routes/admin.routes.js
const express = require("express");
const router = express.Router();
const { getShops, approveShop, rejectShop } = require("../controllers/admin.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// Tất cả các route admin đều yêu cầu authenticate và authorize role admin
router.use(authenticate);
router.use(authorize(["admin"]));

// GET /api/v1/admin/shops — Lấy danh sách shop
router.get("/shops", getShops);

// PATCH /api/v1/admin/shops/:id/approve — Phê duyệt shop
router.patch("/shops/:id/approve", approveShop);

// PATCH /api/v1/admin/shops/:id/reject — Từ chối shop
router.patch("/shops/:id/reject", rejectShop);

module.exports = router;
