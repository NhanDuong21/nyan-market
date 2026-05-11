<!-- // docs/03_Database_Design.md -->

# Nyan Market — Database Design (Mongoose / MongoDB)

> Thiết kế cơ sở dữ liệu cho 6 Collections chính.
> Áp dụng chuẩn hóa 1NF–3NF phù hợp NoSQL, phân định rõ Reference vs Embedded.

---

## Mục lục

- [1. Tổng quan kiến trúc dữ liệu](#1-tổng-quan-kiến-trúc-dữ-liệu)
- [2. Users Collection](#2-users-collection)
- [3. Shops Collection](#3-shops-collection)
- [4. Products Collection](#4-products-collection)
- [5. Orders Collection](#5-orders-collection) 
- [6. Vouchers Collection](#6-vouchers-collection)
- [7. Reviews Collection](#7-reviews-collection)
- [8. Chiến lược Index](#8-chiến-lược-index)

---

## 1. Tổng quan kiến trúc dữ liệu

### Sơ đồ quan hệ

```
Users (1) ──────── (1) Shops
  │                      │
  │ ref: userId          │ ref: shopId
  │                      │
  ├── Orders ◄───────── Products
  │   (embed snapshot)   │
  │                      │
  ├── Reviews ──────────►│ ref: productId
  │   ref: userId        │
  │   ref: orderId       │
  │                      │
  └── Vouchers ◄────────┘ ref: shopId
```

### Nguyên tắc Reference vs Embedded

| Chiến lược | Khi nào dùng | Ví dụ trong dự án |
|------------|-------------|-------------------|
| **Reference** | Dữ liệu thay đổi thường xuyên, quan hệ many-to-many, document con có thể phình lớn | User ↔ Shop, Product ↔ Review |
| **Embedded** | Dữ liệu cần "đóng băng" tại thời điểm ghi, luôn đọc cùng document cha, kích thước giới hạn | Order.items (snapshot giá), Order.shippingAddress |

---

## 2. Users Collection

> **Lý do dùng Reference**: User được tham chiếu bởi nhiều collection (Shops, Orders, Reviews). Tách riêng giúp cập nhật profile mà không ảnh hưởng các document khác.

```javascript
const UserSchema = new mongoose.Schema({
  // === THÔNG TIN CÁ NHÂN ===
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  },
  phone: {
    type: String,
    sparse: true,     // Cho phép null nhưng unique khi có giá trị
    unique: true,
    match: /^(0|\+84)[0-9]{9}$/
  },
  avatar: {
    type: String,
    default: null      // Cloudinary URL
  },

  // === XÁC THỰC ===
  password: {
    type: String,
    required: true,
    select: false      // Không trả về khi query mặc định
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  socialId: {
    type: String,
    default: null       // Google/Facebook ID
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // === PHÂN QUYỀN ===
  roles: {
    type: [String],
    enum: ['user', 'merchant', 'admin'],
    default: ['user']
  },
  status: {
    type: String,
    enum: ['active', 'banned', 'inactive'],
    default: 'active'
  },
  banReason: { type: String, default: null },
  bannedAt:  { type: Date, default: null },
  bannedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // === ĐỊA CHỈ GIAO HÀNG (Embedded - luôn đọc cùng user, tối đa 10) ===
  addresses: [{
    label:      { type: String, required: true },          // "Nhà", "Công ty"
    fullName:   { type: String, required: true },
    phone:      { type: String, required: true },
    province:   { type: String, required: true },
    district:   { type: String, required: true },
    ward:       { type: String, required: true },
    street:     { type: String, required: true },
    isDefault:  { type: Boolean, default: false }
  }],

  // === OTP ===
  otp: {
    code:      { type: String, select: false },
    expiresAt: { type: Date },
    attempts:  { type: Number, default: 0 },      // Đếm số lần nhập sai
    sentCount: { type: Number, default: 0 },       // Đếm số lần gửi (rate limit)
    blockedUntil: { type: Date, default: null }
  },

  refreshToken: { type: String, select: false }

}, { timestamps: true, versionKey: '__v' });
```

> **Lý do Embed `addresses`**: Mỗi user có tối đa ~10 địa chỉ, luôn cần đọc khi checkout. Kích thước nhỏ, không cần tách collection.

> **Lý do Embed `otp`**: Dữ liệu tạm thời, chỉ thuộc 1 user, không bao giờ query độc lập.

---

## 3. Shops Collection

> **Lý do dùng Reference `owner`**: Một User có thể có tối đa 1 Shop. Tách riêng vì Shop có lifecycle riêng (pending → active → banned) và được reference bởi Products, Orders, Vouchers.

```javascript
const ShopSchema = new mongoose.Schema({
  // === CHỦ SỞ HỮU (Reference) ===
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true        // 1 User = 1 Shop
  },

  // === THÔNG TIN SHOP ===
  shopName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true     // URL-friendly: /shop/nyan-fashion
  },
  description: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  logo:   { type: String, default: null },    // Cloudinary URL
  banner: { type: String, default: null },

  // === LIÊN HỆ & ĐỊA CHỈ ===
  phone: { type: String, required: true },
  address: {
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward:     { type: String, required: true },
    street:   { type: String, required: true }
  },

  // === TRẠNG THÁI DUYỆT ===
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected', 'banned'],
    default: 'pending'
  },
  rejectionReason: { type: String, default: null },
  approvedAt:      { type: Date, default: null },
  approvedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // === KYC (Embedded - luôn đọc cùng shop khi admin review) ===
  kyc: {
    idCardFront:     { type: String },     // Cloudinary URL
    idCardBack:      { type: String },
    businessLicense: { type: String, default: null },
    storePhotos:     { type: [String], default: [] },
    submittedAt:     { type: Date },
    resubmitCount:   { type: Number, default: 0 }   // Tối đa 3 lần
  },

  // === THỐNG KÊ (Denormalized - cập nhật qua aggregation job) ===
  stats: {
    totalProducts:  { type: Number, default: 0 },
    totalSold:      { type: Number, default: 0 },
    rating:         { type: Number, default: 0, min: 0, max: 5 },
    totalReviews:   { type: Number, default: 0 },
    followerCount:  { type: Number, default: 0 }
  },

  // === CẤU HÌNH ===
  commissionRate: {
    type: Number,
    default: 5,          // 5% phí sàn mặc định
    min: 0,
    max: 100
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }]

}, { timestamps: true });
```

> **Lý do Embed `kyc`**: Tài liệu KYC chỉ thuộc 1 shop, luôn xem cùng shop khi admin duyệt. Kích thước cố định, không phình.

> **Lý do Embed `stats`**: Denormalized data, tránh aggregation nặng mỗi lần load trang shop (SSR).

---

## 4. Products Collection

> **Lý do KHÔNG embed Reviews**: Mảng reviews có thể phình vô hạn → vượt giới hạn 16MB/document. Tách thành collection Reviews riêng, reference ngược bằng `productId`.

```javascript
const ProductSchema = new mongoose.Schema({
  // === SHOP (Reference) ===
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },

  // === THÔNG TIN SẢN PHẨM ===
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 10000
  },
  images: {
    type: [String],       // Cloudinary URLs, tối đa 9
    validate: [arr => arr.length <= 9, 'Tối đa 9 ảnh']
  },
  video: { type: String, default: null },

  // === PHÂN LOẠI (Reference - Category thay đổi độc lập) ===
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{ type: String, lowercase: true, trim: true }],

  // === GIÁ & TỒN KHO ===
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,        // Giá gốc trước giảm (hiển thị gạch ngang)
    default: null,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },

  // === BIẾN THỂ (Embedded - luôn đọc cùng product, số lượng giới hạn) ===
  variants: [{
    sku: {
      type: String,
      required: true      // VD: "NYM-SHIRT-RED-M"
    },
    attributes: {
      type: Map,
      of: String           // { color: "Đỏ", size: "M" }
    },
    price:    { type: Number, required: true, min: 0 },
    stock:    { type: Number, required: true, min: 0 },
    images:   [String]
  }],

  // === THỐNG KÊ (Denormalized) ===
  sold:         { type: Number, default: 0 },
  rating:       { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  viewCount:    { type: Number, default: 0 },

  // === TRẠNG THÁI ===
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  isDeleted: {
    type: Boolean,
    default: false       // Soft delete
  },
  deletedAt: { type: Date, default: null }

}, { timestamps: true });
```

> **Lý do Embed `variants`**: Mỗi sản phẩm có tối đa ~50 biến thể, luôn cần đọc cùng product khi render trang chi tiết (SSR). Kích thước có giới hạn.

> **Lý do Denormalize `sold`, `rating`**: Tránh JOIN/Lookup nặng khi render danh sách sản phẩm (SSG/ISR). Cập nhật qua atomic `$inc`.

---

## 5. Orders Collection

> **Chiến lược Embedded Snapshot**: `items`, `shopSnapshot`, `shippingAddress` được **đóng băng tại thời điểm đặt hàng**. Khi Merchant đổi giá/tên sản phẩm hoặc user đổi địa chỉ → Order không bị ảnh hưởng. Đây là yêu cầu bắt buộc cho tính toàn vẹn lịch sử giao dịch.

```javascript
const OrderSchema = new mongoose.Schema({
  // === REFERENCE IDs (để truy vấn, lookup khi cần) ===
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },

  // === ORDER CODE (hiển thị cho user) ===
  orderCode: {
    type: String,
    unique: true,
    required: true        // VD: "NYM-20260512-A1B2C3"
  },

  // === SNAPSHOT SẢN PHẨM (Embedded - đóng băng giá tại thời điểm mua) ===
  items: [{
    product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },  // Ref để truy ngược nếu cần
    productName: { type: String, required: true },       // Snapshot
    productImage:{ type: String, required: true },       // Snapshot
    variantSku:  { type: String, default: null },
    variantAttributes: { type: Map, of: String },        // { color: "Đỏ", size: "M" }
    price:       { type: Number, required: true },       // Giá tại thời điểm mua
    quantity:    { type: Number, required: true, min: 1 }
  }],

  // === SNAPSHOT SHOP (Embedded) ===
  shopSnapshot: {
    shopName: { type: String, required: true },
    logo:     { type: String, default: null }
  },

  // === SNAPSHOT ĐỊA CHỈ GIAO (Embedded) ===
  shippingAddress: {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward:     { type: String, required: true },
    street:   { type: String, required: true }
  },

  // === TÍNH TIỀN ===
  subtotal:      { type: Number, required: true },   // Σ(price × qty)
  shippingFee:   { type: Number, required: true, default: 0 },
  discount:      { type: Number, default: 0 },       // Tiền giảm từ voucher
  totalAmount:   { type: Number, required: true },   // subtotal - discount + shippingFee
  commission:    { type: Number, default: 0 },       // Phí sàn = totalAmount × rate

  // === VOUCHER (Reference + snapshot giá trị đã dùng) ===
  voucher: {
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', default: null },
    code:      { type: String, default: null },
    discount:  { type: Number, default: 0 }          // Snapshot số tiền đã giảm
  },

  // === THANH TOÁN ===
  paymentMethod: {
    type: String,
    enum: ['cod', 'vnpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded', 'failed'],
    default: 'unpaid'
  },
  vnpayTxnRef:  { type: String, default: null, sparse: true, unique: true },
  paidAt:       { type: Date, default: null },

  // === TRẠNG THÁI ĐƠN HÀNG ===
  status: {
    type: String,
    enum: [
      'pending_confirmation',   // Chờ merchant xác nhận
      'confirmed',              // Merchant đã xác nhận
      'processing',             // Đang đóng gói
      'shipping',               // Đã giao cho ĐVVC
      'delivered',              // Đã giao thành công
      'completed',              // Hoàn tất (sau 7 ngày không khiếu nại)
      'cancelled',              // Đã hủy
      'return_requested',       // Yêu cầu trả hàng
      'returned'                // Đã trả hàng + hoàn tiền
    ],
    default: 'pending_confirmation'
  },
  cancelReason:  { type: String, default: null },
  cancelledBy:   { type: String, enum: ['user', 'merchant', 'system'], default: null },

  // === TRACKING ===
  statusHistory: [{
    status:    { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note:      { type: String, default: null }
  }],

  // === THỜI HẠN ===
  paymentDeadline: { type: Date, default: null }   // VNPAY: 15 phút để thanh toán

}, { timestamps: true });
```

> **Tại sao Embed `items` thay vì Reference?** Nếu dùng Reference `productId` rồi lookup giá → khi Merchant đổi giá, lịch sử đơn hàng bị sai. Snapshot đảm bảo dữ liệu chính xác tuyệt đối.

> **Tại sao vẫn giữ `product: ObjectId` trong items?** Để có thể truy ngược về trang sản phẩm (link "Mua lại"), nhưng KHÔNG dùng để lấy giá.

---

## 6. Vouchers Collection

```javascript
const VoucherSchema = new mongoose.Schema({
  // === SHOP (Reference) ===
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },

  // === THÔNG TIN VOUCHER ===
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 6,
    maxlength: 12
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },

  // === LOẠI GIẢM GIÁ ===
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0              // 10 = 10% hoặc 50000 = 50.000đ
  },
  maxDiscount: {
    type: Number,        // Giảm tối đa (cho type: percentage)
    default: null
  },

  // === ĐIỀU KIỆN ÁP DỤNG ===
  minOrderValue: {
    type: Number,
    default: 0           // Đơn tối thiểu
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'      // Null/empty = tất cả danh mục
  }],

  // === GIỚI HẠN SỬ DỤNG ===
  maxUsage: {
    type: Number,
    required: true        // Tổng lượt sử dụng
  },
  maxUsagePerUser: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0            // Cập nhật qua atomic $inc
  },
  usedByUsers: [{
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    count: { type: Number, default: 1 },
    usedAt: { type: Date, default: Date.now }
  }],

  // === THỜI HẠN ===
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },

  // === TRẠNG THÁI ===
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  }

}, { timestamps: true });
```

---

## 7. Reviews Collection

> **Lý do tách riêng**: Reviews có thể phình vô hạn. Nếu embed trong Product → vượt 16MB limit. Tách riêng + reference `productId` cho phép phân trang, filter linh hoạt.

> **Ràng buộc nghiệp vụ**: `orderId` bắt buộc → chỉ user đã mua thành công (order `completed`) mới được review. Compound index `{ user, product, order }` unique → 1 review / sản phẩm / đơn hàng.

```javascript
const ReviewSchema = new mongoose.Schema({
  // === REFERENCES ===
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true        // Bắt buộc → đảm bảo đã mua mới được review
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },

  // === NỘI DUNG ===
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  images: {
    type: [String],       // Cloudinary URLs
    validate: [arr => arr.length <= 5, 'Tối đa 5 ảnh']
  },
  video: { type: String, default: null },

  // === MERCHANT PHẢN HỒI (Embedded - 1:1 với review) ===
  reply: {
    content:   { type: String, maxlength: 1000 },
    repliedAt: { type: Date }
  },

  // === TRẠNG THÁI ===
  isHidden: {
    type: Boolean,
    default: false        // Admin có thể ẩn review vi phạm
  }

}, { timestamps: true });
```

---

## 8. Chiến lược Index

```javascript
// === USERS ===
UserSchema.index({ email: 1 });                          // Login lookup
UserSchema.index({ status: 1, roles: 1 });               // Admin quản lý

// === SHOPS ===
ShopSchema.index({ slug: 1 });                           // SSR trang shop profile
ShopSchema.index({ status: 1 });                         // Admin duyệt merchant
ShopSchema.index({ owner: 1 });                          // Lookup shop by user

// === PRODUCTS ===
ProductSchema.index({ slug: 1 });                        // SSR trang chi tiết SP
ProductSchema.index({ shop: 1, isDeleted: 1 });          // Merchant quản lý SP
ProductSchema.index({ category: 1, status: 1 });         // SSG/ISR trang danh mục
ProductSchema.index({ status: 1, sold: -1 });            // Sort bán chạy nhất
ProductSchema.index({ status: 1, createdAt: -1 });       // Sort mới nhất
ProductSchema.index({ status: 1, price: 1 });            // Sort theo giá
ProductSchema.index({                                    // Full-text search
  name: 'text', description: 'text', tags: 'text'
}, { weights: { name: 10, tags: 5, description: 1 } });

// === ORDERS ===
OrderSchema.index({ user: 1, createdAt: -1 });           // User xem lịch sử
OrderSchema.index({ shop: 1, status: 1 });               // Merchant xem đơn hàng
OrderSchema.index({ orderCode: 1 });                     // Tra cứu đơn
OrderSchema.index({ status: 1, paymentDeadline: 1 });    // Scheduled job hủy đơn
OrderSchema.index({ vnpayTxnRef: 1 });                   // VNPAY callback lookup

// === VOUCHERS ===
VoucherSchema.index({ code: 1 });                        // Áp dụng voucher
VoucherSchema.index({ shop: 1, status: 1 });             // Merchant quản lý
VoucherSchema.index({ endDate: 1, status: 1 });          // Auto-expire job

// === REVIEWS ===
ReviewSchema.index({ product: 1, createdAt: -1 });       // Trang chi tiết SP
ReviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true }); // 1 review/SP/đơn
ReviewSchema.index({ shop: 1, rating: 1 });              // Merchant xem đánh giá
```

### Giải thích ưu tiên Index

| Trang (Render) | Query chính | Index phục vụ |
|----------------|-------------|---------------|
| **Product Detail (SSR)** | Lookup by slug, reviews by productId | `slug_1`, `product_1_createdAt_-1` |
| **Category Page (ISR)** | Filter by category + status, sort | `category_1_status_1`, `status_1_sold_-1` |
| **Search (SSR)** | Text search by name/tags | Text index (weighted) |
| **User Dashboard (CSR)** | Orders by userId sorted by date | `user_1_createdAt_-1` |
| **Merchant Dashboard (CSR)** | Orders/Products by shopId | `shop_1_status_1`, `shop_1_isDeleted_1` |

---

## Ghi chú phiên bản

| Phiên bản | Ngày cập nhật | Ghi chú |
|-----------|---------------|---------|
| v1.0 | 2026-05-12 | Khởi tạo thiết kế 6 collections chính |

---

> **Tài liệu này là cơ sở cho việc implement Mongoose Models.**
> Mọi thay đổi schema phải được cập nhật tại đây trước khi code.
