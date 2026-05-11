<!-- // docs/04_Phase_Plan.md -->

# Nyan Market — Kế hoạch triển khai theo Phase

> Chia dự án thành 5 giai đoạn, đi từ Foundation → Advanced.
> Mỗi Phase ghi rõ đầu việc Backend & Frontend kèm loại Render.

---

## Mục lục

- [Phase 1: Foundation, Auth & Profile](#phase-1-foundation-auth--profile)
- [Phase 2: Merchant Onboarding & Inventory](#phase-2-merchant-onboarding--inventory)
- [Phase 3: User Shopping Experience](#phase-3-user-shopping-experience)
- [Phase 4: Checkout & Order Fulfillment](#phase-4-checkout--order-fulfillment)
- [Phase 5: Administration & Analytics](#phase-5-administration--analytics)
- [Tổng quan tiến độ](#tổng-quan-tiến-độ)

---

## Phase 1: Foundation, Auth & Profile

> **Mục tiêu**: Dựng móng dự án — server, database, auth, layout gốc, theme Vàng-Trắng.

### Backend

- [ ] Setup Node.js server (Express hoặc NestJS), cấu trúc folder chuẩn
- [ ] Kết nối MongoDB Atlas + Mongoose, seed data cơ bản
- [ ] Cấu hình biến môi trường (`.env`), CORS, error handling middleware
- [ ] Implement JWT (Access Token 15m + Refresh Token 7d)
- [ ] Tích hợp Nodemailer — gửi OTP qua email
- [ ] API: `POST /auth/register` — Gửi OTP đến email
- [ ] API: `POST /auth/verify-otp` — Xác thực OTP, trả `tempToken`
- [ ] API: `POST /auth/set-password` — Thiết lập mật khẩu, trả tokens
- [ ] API: `POST /auth/login` — Đăng nhập bằng email + password
- [ ] API: `POST /auth/refresh-token` — Làm mới access token
- [ ] API: `GET /auth/me` — Lấy thông tin user hiện tại
- [ ] API: `PUT /users/profile` — Cập nhật hồ sơ cá nhân
- [ ] API: `PUT /users/addresses` — CRUD địa chỉ giao hàng
- [ ] Middleware: `authenticate` (verify JWT), `authorize(roles[])`
- [ ] Rate limiting cho OTP (3 lần/15 phút), block sau 5 lần sai

### Frontend

- [ ] Khởi tạo Next.js 14 (App Router), cấu hình TypeScript
- [ ] Cấu hình Tailwind CSS — Theme Vàng-Trắng (`primary: #FACC15`, `bg: #FFFFFF`)
- [ ] Setup Google Fonts (Inter)
- [ ] Tạo Root Layout (`app/layout.tsx`): Header, Footer, global styles
- [ ] Component: `Header` (Logo, Search bar, Cart icon, User menu)
- [ ] Component: `Footer` (Links, Copyright)
- [ ] Trang Đăng ký — `/register` **(CSR)**: Form email → OTP → Set password
- [ ] Trang Đăng nhập — `/login` **(CSR)**: Form email + password
- [ ] Trang Hồ sơ — `/user/profile` **(CSR)**: Chỉnh sửa thông tin, avatar, địa chỉ
- [ ] Auth Context/Provider: Quản lý state đăng nhập, token storage
- [ ] Protected Route HOC: Redirect nếu chưa đăng nhập
- [ ] Toast notification component (success/error feedback)

### Kết quả Phase 1

| Deliverable | Mô tả |
|-------------|--------|
| Server chạy ổn định | Express/NestJS + MongoDB connected |
| Auth flow hoàn chỉnh | Register (OTP) → Login → JWT → Protected routes |
| Layout gốc | Header/Footer, theme Vàng-Trắng, responsive |
| User profile | Xem/sửa thông tin, quản lý địa chỉ |

---

## Phase 2: Merchant Onboarding & Inventory

> **Mục tiêu**: Cho phép User đăng ký bán hàng, quản lý sản phẩm và danh mục.

### Backend

- [ ] Tạo Mongoose Models: `Shop`, `Product`, `Category`
- [ ] API: `POST /shops/register` — Đăng ký mở shop (status: `pending`)
- [ ] API: `POST /shops/kyc` — Upload tài liệu KYC (Cloudinary)
- [ ] API: `GET /shops/my-shop` — Lấy thông tin shop của merchant
- [ ] API: `PUT /shops/my-shop` — Cập nhật thông tin shop
- [ ] Middleware: `isMerchant` — Check role + shop status `active`
- [ ] Tích hợp Cloudinary SDK — Upload/Delete/Transform ảnh
- [ ] API: `POST /products` — Tạo sản phẩm mới (kèm variants)
- [ ] API: `GET /products/my-products` — Danh sách SP của merchant (phân trang)
- [ ] API: `PUT /products/:id` — Cập nhật sản phẩm
- [ ] API: `DELETE /products/:id` — Soft delete sản phẩm
- [ ] API: `PATCH /products/:id/stock` — Cập nhật tồn kho (atomic `$inc`)
- [ ] API: `GET /categories` — Danh sách danh mục (tree structure)
- [ ] API: `POST /categories` — Tạo danh mục (Admin only)
- [ ] Validation: Kiểm tra tên shop unique, file upload format/size
- [ ] Auto-generate slug cho Shop và Product

### Frontend

- [ ] Trang Đăng ký Shop — `/merchant/register` **(CSR)**: Multi-step form (Info → KYC → Submit)
- [ ] Trang Chờ duyệt — `/merchant/pending` **(CSR)**: Hiển thị status pending/rejected
- [ ] Layout Merchant Dashboard — `/merchant/*` **(CSR)**: Sidebar navigation, header
- [ ] Trang Quản lý SP — `/merchant/products` **(CSR)**: Table danh sách, search, filter
- [ ] Form Thêm/Sửa SP — `/merchant/products/new` & `edit` **(CSR)**
- [ ] Component: Image uploader (Drag & drop, preview, max 9 ảnh)
- [ ] Component: Variant manager (Thêm/xóa biến thể, SKU, giá riêng)
- [ ] Trang Quản lý tồn kho — `/merchant/inventory` **(CSR)**: Low stock alerts
- [ ] Component: Category selector (Dropdown tree)

### Kết quả Phase 2

| Deliverable | Mô tả |
|-------------|--------|
| Merchant onboarding | Đăng ký shop → KYC → Chờ duyệt |
| CRUD sản phẩm | Thêm/sửa/xóa SP với ảnh, variants, danh mục |
| Quản lý tồn kho | Xem stock, cảnh báo hết hàng |
| Merchant Dashboard shell | Layout sidebar, navigation cơ bản |

---

## Phase 3: User Shopping Experience

> **Mục tiêu**: Xây dựng trải nghiệm mua sắm — trang chủ, tìm kiếm, chi tiết SP, giỏ hàng.

### Backend

- [ ] API: `GET /products` — Danh sách SP công khai (filter, sort, phân trang)
- [ ] API: `GET /products/:slug` — Chi tiết SP (populate shop, category)
- [ ] API: `GET /products/search?q=` — Full-text search (weighted)
- [ ] API: `GET /categories/:slug/products` — SP theo danh mục
- [ ] API: `GET /shops/:slug` — Thông tin shop công khai + SP
- [ ] API: `GET /products/featured` — SP nổi bật (bán chạy, mới nhất)
- [ ] API: `POST /cart/sync` — Đồng bộ giỏ hàng từ client lên DB
- [ ] API: `GET /cart` — Lấy giỏ hàng (validate stock real-time)
- [ ] API: `PUT /cart` — Cập nhật giỏ hàng
- [ ] Query optimization: Lean queries, projection, populate chọn lọc
- [ ] Cache layer: Redis cho featured products, categories (TTL 5m)

### Frontend

- [ ] **Trang chủ** — `/` **(SSG + ISR revalidate 60s)**
  - [ ] Hero Banner slider (Primary Yellow gradient background)
  - [ ] Danh mục nổi bật (grid icons)
  - [ ] Sản phẩm bán chạy (carousel)
  - [ ] Sản phẩm mới nhất (grid)
  - [ ] Flash sale section (countdown timer)
- [ ] **Trang danh mục** — `/category/:slug` **(ISR revalidate 120s)**
  - [ ] Sidebar filter (giá, đánh giá, địa điểm)
  - [ ] Sort: Phổ biến, Mới nhất, Giá tăng/giảm
  - [ ] Product grid + pagination
- [ ] **Trang tìm kiếm** — `/search?q=` **(ISR)**
  - [ ] Search results grid
  - [ ] Filter & sort controls
  - [ ] Empty state khi không có kết quả
- [ ] **Trang chi tiết SP** — `/product/:slug` **(SSR)**
  - [ ] Image gallery (zoom, slide)
  - [ ] Thông tin giá, tồn kho (luôn mới nhất)
  - [ ] Variant selector (màu, size)
  - [ ] Nút "Thêm vào giỏ", "Mua ngay"
  - [ ] Thông tin shop (mini card)
  - [ ] Reviews section (phân trang)
- [ ] **Trang Shop** — `/shop/:slug` **(SSR)**
  - [ ] Shop banner, logo, stats
  - [ ] Danh sách SP của shop (grid + filter)
- [ ] **Giỏ hàng** — `/cart` **(CSR)**
  - [ ] LocalStorage sync + DB sync khi đã đăng nhập
  - [ ] Cập nhật số lượng, xóa item
  - [ ] Hiển thị tổng tiền real-time
  - [ ] Check stock trước khi checkout
- [ ] Component: `ProductCard` (Ảnh, Tên, Giá, Rating, Sold)
- [ ] Component: `SearchBar` (Autocomplete, lịch sử tìm kiếm)

### Kết quả Phase 3

| Deliverable | Mô tả |
|-------------|--------|
| Home page (SSG) | Load cực nhanh, banner, SP nổi bật |
| Search & Filter | Full-text search, filter đa chiều |
| Product Detail (SSR) | Giá/kho luôn mới nhất, SEO tốt |
| Shopping Cart (CSR) | Sync localStorage ↔ DB |

---

## Phase 4: Checkout & Order Fulfillment

> **Mục tiêu**: Hoàn thiện luồng thanh toán, quản lý đơn hàng, đánh giá sản phẩm.

### Backend

- [ ] API: `POST /orders` — Tạo đơn hàng (snapshot giá, check stock, áp voucher)
- [ ] Implement Optimistic Locking cho stock (version key `__v`)
- [ ] Tích hợp VNPAY Sandbox SDK — Tạo payment URL
- [ ] API: `GET /payments/vnpay/ipn` — IPN callback (verify checksum)
- [ ] API: `GET /payments/vnpay/return` — Return URL handler
- [ ] API: `GET /orders` — Danh sách đơn hàng (user/merchant)
- [ ] API: `GET /orders/:id` — Chi tiết đơn hàng
- [ ] API: `PATCH /orders/:id/status` — Cập nhật trạng thái (merchant)
- [ ] API: `POST /orders/:id/cancel` — Hủy đơn (user/merchant)
- [ ] Scheduled Job: Auto-cancel VNPAY chưa thanh toán sau 15 phút
- [ ] Scheduled Job: Auto-complete đơn sau 7 ngày delivered
- [ ] Hoàn stock khi đơn bị hủy (atomic `$inc`)
- [ ] API: `POST /reviews` — Tạo đánh giá (check order completed)
- [ ] API: `GET /reviews/product/:id` — Đánh giá theo SP (phân trang)
- [ ] Update Product `rating`, `totalReviews` sau mỗi review
- [ ] WebSocket: Emit sự kiện khi order status thay đổi
- [ ] API: `POST /vouchers` — Merchant tạo voucher
- [ ] API: `POST /vouchers/apply` — Validate + áp dụng voucher

### Frontend

- [ ] **Trang Checkout** — `/checkout` **(CSR)**
  - [ ] Chọn địa chỉ giao hàng
  - [ ] Áp dụng voucher (input code → validate)
  - [ ] Chọn phương thức thanh toán (COD / VNPAY)
  - [ ] Bảng tổng kết đơn hàng
  - [ ] Nút "Đặt hàng"
- [ ] **Trang xác nhận đơn** — `/order/success/:id` **(CSR)**
- [ ] **Trang đơn hàng User** — `/user/orders` **(CSR)**
  - [ ] Tabs trạng thái, card đơn hàng, nút actions
- [ ] **Chi tiết đơn hàng** — `/user/orders/:id` **(CSR)**
  - [ ] Timeline tracking (real-time WebSocket)
- [ ] **Form đánh giá** — Modal **(CSR)**: Stars, comment, upload ảnh
- [ ] **Đơn hàng Merchant** — `/merchant/orders` **(CSR)**
  - [ ] Danh sách đơn mới, nút Duyệt/Từ chối, cập nhật giao hàng
- [ ] **Quản lý Voucher** — `/merchant/vouchers` **(CSR)**: CRUD voucher

### Kết quả Phase 4

| Deliverable | Mô tả |
|-------------|--------|
| Checkout flow | COD + VNPAY Sandbox hoạt động |
| Order management | User theo dõi, Merchant xử lý đơn |
| Real-time tracking | WebSocket cập nhật trạng thái |
| Reviews & Vouchers | Đánh giá sau mua, tạo/áp dụng voucher |

---

## Phase 5: Administration & Analytics

> **Mục tiêu**: Admin Panel, thống kê doanh thu, duyệt Merchant, tối ưu performance.

### Backend

- [ ] API: `GET /admin/merchants` — Danh sách merchant (filter by status)
- [ ] API: `PATCH /admin/merchants/:id/approve` — Phê duyệt shop
- [ ] API: `PATCH /admin/merchants/:id/reject` — Từ chối (kèm lý do)
- [ ] API: `GET /admin/users` — Danh sách users (search, filter, phân trang)
- [ ] API: `PATCH /admin/users/:id/ban` — Ban user
- [ ] API: `PATCH /admin/users/:id/unban` — Unban user
- [ ] API: `GET /admin/dashboard/overview` — GMV, tổng đơn, users mới
- [ ] API: `GET /admin/dashboard/revenue` — Doanh thu theo ngày/tháng
- [ ] API: `GET /admin/dashboard/growth` — Tăng trưởng users/merchants
- [ ] API: `GET /admin/dashboard/top-products` — SP bán chạy toàn sàn
- [ ] API: `GET /admin/dashboard/top-merchants` — Merchants doanh thu cao
- [ ] API: `GET /merchant/dashboard/stats` — Thống kê riêng cho shop
- [ ] API: `GET /merchant/dashboard/revenue` — Doanh thu shop theo period
- [ ] Aggregation Pipelines cho báo cáo
- [ ] API: CRUD Banners (`/admin/banners`)
- [ ] API: Cấu hình phí sàn (`/admin/settings/commission`)
- [ ] Caching Redis cho dashboard queries

### Frontend

- [ ] **Layout Admin** — `/admin/*` **(CSR)**: Sidebar, topbar, breadcrumb
- [ ] **Admin Dashboard** — `/admin` **(CSR)**
  - [ ] KPI Cards: GMV, Tổng đơn, Users mới, Merchants mới
  - [ ] Area Chart: Doanh thu theo thời gian
  - [ ] Bar Chart: Tăng trưởng users/merchants
  - [ ] Table: Top merchants, Top sản phẩm
- [ ] **Duyệt Merchant** — `/admin/merchants` **(CSR)**
  - [ ] Table, Modal xem KYC, nút Approve/Reject
- [ ] **Quản lý Users** — `/admin/users` **(CSR)**
  - [ ] Table, search, filter, Ban/Unban
- [ ] **Quản lý Banners** — `/admin/banners` **(CSR)**: CRUD, drag-drop
- [ ] **Cấu hình** — `/admin/settings` **(CSR)**: Phí sàn, danh mục
- [ ] **Merchant Dashboard** — `/merchant/dashboard` **(CSR)**
  - [ ] KPI Cards, Line Chart doanh thu, Bar Chart SP bán chạy
- [ ] Chart library: Recharts hoặc Chart.js

### Kết quả Phase 5

| Deliverable | Mô tả |
|-------------|--------|
| Admin Panel | Dashboard, duyệt Merchant, quản lý Users |
| Merchant Analytics | Doanh thu, AOV, biểu đồ |
| Banner & Settings | CRUD banner, cấu hình phí sàn |

---

## Tổng quan tiến độ

| Phase | Tên | BE | FE | Tổng |
|-------|-----|:--:|:--:|:----:|
| 1 | Foundation, Auth & Profile | 15 | 12 | 27 |
| 2 | Merchant Onboarding & Inventory | 16 | 9 | 25 |
| 3 | User Shopping Experience | 11 | 22 | 33 |
| 4 | Checkout & Order Fulfillment | 18 | 14 | 32 |
| 5 | Administration & Analytics | 17 | 14 | 31 |
| | **Tổng cộng** | **77** | **71** | **148** |

### Render Strategy Map

| Render | Trang | Phase |
|--------|-------|:-----:|
| **SSG + ISR** | Home `/` | 3 |
| **ISR** | Category, Search | 3 |
| **SSR** | Product Detail, Shop Profile | 3 |
| **CSR** | Login, Register, Profile | 1 |
| **CSR** | Merchant Dashboard, Products, Inventory | 2 |
| **CSR** | Cart, Checkout, Orders, Reviews | 4 |
| **CSR** | Admin Panel, Analytics, Settings | 5 |

---

## Ghi chú phiên bản

| Phiên bản | Ngày cập nhật | Ghi chú |
|-----------|---------------|---------|
| v1.0 | 2026-05-12 | Khởi tạo kế hoạch 5 Phase |

---

> **Checklist này sẽ được cập nhật `[x]` khi hoàn thành từng task.**
> Mọi thay đổi scope phải được đánh giá tác động lên các Phase liên quan.
