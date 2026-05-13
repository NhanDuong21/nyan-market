// server/src/utils/slug.js

/**
 * Chuyển đổi chuỗi tiếng Việt thành slug URL-friendly.
 * Dùng chung cho Shop, Product, và bất kỳ entity nào cần slug.
 *
 * @param {string} text - Chuỗi cần chuyển đổi
 * @returns {string} Slug dạng kebab-case, không dấu
 *
 * @example
 * generateSlug("Áo Thun Nyan Market 2026") → "ao-thun-nyan-market-2026"
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")                  // Chuẩn hóa Unicode để tách dấu
    .replace(/[\u0300-\u036f]/g, "")   // Xóa dấu
    .replace(/[đĐ]/g, "d")            // Thay chữ đ
    .replace(/[^a-z0-9]+/g, "-")       // Thay khoảng trắng và ký tự đặc biệt
    .replace(/^-+|-+$/g, "");          // Xóa gạch ngang ở đầu/cuối
};

/**
 * Tạo slug duy nhất bằng cách kiểm tra DB.
 *
 * @param {string} text - Chuỗi gốc
 * @param {import('mongoose').Model} Model - Mongoose model để kiểm tra trùng
 * @returns {Promise<string>} Slug duy nhất
 */
const generateUniqueSlug = async (text, Model) => {
  const baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;

  while (await Model.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

module.exports = { generateSlug, generateUniqueSlug };
