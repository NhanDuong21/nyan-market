// server/src/controllers/shop.controller.js
const Shop = require("../models/Shop");
const User = require("../models/User");

const cloudinary = require("../config/cloudinary");

// Helper: Chuyển đổi tên shop thành slug URL-friendly
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD") // Chuẩn hóa Unicode để tách dấu
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .replace(/[đĐ]/g, "d") // Thay chữ đ
    .replace(/[^a-z0-9]+/g, "-") // Thay khoảng trắng và ký tự đặc biệt bằng gạch ngang
    .replace(/^-+|-+$/g, ""); // Xóa gạch ngang ở đầu và cuối
};

// POST /api/v1/shops/register
// Đăng ký mở quán (Merchant Onboarding)
// Headers: Authorization: Bearer <token>
const registerShop = async (req, res) => {
  try {
    const { shopName, description, phone, address, categories } = req.body;
    const userId = req.user.id;

    // 1. Kiểm tra User đã có shop chưa
    const existingShopOwner = await Shop.findOne({ owner: userId });
    if (existingShopOwner) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đăng ký mở quán rồi. Vui lòng kiểm tra trạng thái duyệt.",
      });
    }

    // Parse address since it might be sent as a stringified JSON in FormData
    let parsedAddress;
    try {
      parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Định dạng địa chỉ không hợp lệ",
      });
    }

    // 2. Validate input cơ bản
    if (!shopName || !phone || !parsedAddress || !parsedAddress.province || !parsedAddress.district || !parsedAddress.ward || !parsedAddress.street) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc (Tên quán, SĐT, Địa chỉ)",
      });
    }

    // 3. Kiểm tra Tên quán đã tồn tại chưa
    const existingShopName = await Shop.findOne({ shopName: new RegExp(`^${shopName}$`, "i") });
    if (existingShopName) {
      return res.status(409).json({
        success: false,
        message: "Tên quán đã được sử dụng. Vui lòng chọn tên khác.",
      });
    }

    // 4. Lấy URLs từ file upload
    let idCardFrontUrl = "";
    let idCardBackUrl = "";
    if (req.files) {
      if (req.files.idCardFront && req.files.idCardFront.length > 0) {
        idCardFrontUrl = req.files.idCardFront[0].path; // Cloudinary URL
      }
      if (req.files.idCardBack && req.files.idCardBack.length > 0) {
        idCardBackUrl = req.files.idCardBack[0].path;
      }
    }

    // 5. Tạo slug từ Tên quán
    let baseSlug = generateSlug(shopName);
    let slug = baseSlug;
    let slugCounter = 1;
    
    while (await Shop.findOne({ slug })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Parse categories if stringified
    let parsedCategories = [];
    try {
      parsedCategories = typeof categories === "string" ? JSON.parse(categories) : (categories || []);
    } catch(e) {}

    // 6. Lưu thông tin quán mới
    const newShop = await Shop.create({
      owner: userId,
      shopName,
      slug,
      description: description || "",
      phone,
      address: parsedAddress,
      categories: parsedCategories,
      kyc: {
        idCardFront: idCardFrontUrl,
        idCardBack: idCardBackUrl,
        submittedAt: new Date(),
      }
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký mở quán thành công. Vui lòng chờ Admin phê duyệt.",
      data: {
        shop: newShop,
      },
    });

  } catch (error) {
    console.error("Register Shop Error:", error.message);
    
    // Xóa ảnh đã upload lên Cloudinary nếu lưu DB thất bại
    if (req.files) {
      if (req.files.idCardFront && req.files.idCardFront[0].filename) {
        await cloudinary.uploader.destroy(req.files.idCardFront[0].filename).catch(console.error);
      }
      if (req.files.idCardBack && req.files.idCardBack[0].filename) {
        await cloudinary.uploader.destroy(req.files.idCardBack[0].filename).catch(console.error);
      }
    }
    
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

module.exports = {
  registerShop,
};
