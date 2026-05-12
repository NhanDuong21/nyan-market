// server/src/routes/category.routes.js
const express = require("express");
const router = express.Router();
const { getCategories } = require("../controllers/category.controller");

// GET /api/v1/categories — Lấy danh sách danh mục
router.get("/", getCategories);

module.exports = router;
