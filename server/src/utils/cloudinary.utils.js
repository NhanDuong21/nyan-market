// server/src/utils/cloudinary.utils.js
const cloudinary = require("../config/cloudinary");

/**
 * Xóa danh sách file đã upload lên Cloudinary (rollback khi DB lưu thất bại).
 *
 * @param {Array<{filename?: string, path?: string}>} files - Mảng file objects từ Multer
 * @returns {Promise<void>}
 */
const rollbackUploads = async (files) => {
  if (!files || files.length === 0) return;

  const deletePromises = files.map((file) => {
    const publicId = file.filename || file.public_id;
    if (!publicId) return Promise.resolve();
    return cloudinary.uploader.destroy(publicId).catch(console.error);
  });

  await Promise.all(deletePromises);
};

/**
 * Xóa file upload theo tên trường (dùng cho req.files dạng object — fields upload).
 *
 * @param {Object} filesObject - req.files object từ multer.fields()
 * @param {string[]} fieldNames - Tên các trường cần rollback
 * @returns {Promise<void>}
 */
const rollbackFieldUploads = async (filesObject, fieldNames) => {
  if (!filesObject) return;

  const deletePromises = [];
  for (const field of fieldNames) {
    if (filesObject[field] && filesObject[field].length > 0) {
      const file = filesObject[field][0];
      if (file.filename) {
        deletePromises.push(
          cloudinary.uploader.destroy(file.filename).catch(console.error)
        );
      }
    }
  }

  await Promise.all(deletePromises);
};

module.exports = { rollbackUploads, rollbackFieldUploads };
