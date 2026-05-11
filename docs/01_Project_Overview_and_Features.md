<!-- // docs/01_Project_Overview_and_Features.md -->

# Nyan Market — Project Overview & Features

> **Nền tảng Multi-vendor E-commerce (Shopee Clone)**
> Tài liệu quy chuẩn — Source of Truth cho toàn bộ quá trình phát triển.

---

## Mục lục (Table of Contents)

- [1. Tổng quan dự án](#1-tổng-quan-dự-án)
- [2. Tech Stack](#2-tech-stack)
- [3. Quy chuẩn UI/UX & Design System](#3-quy-chuẩn-uiux--design-system)
- [4. Chiến lược Render](#4-chiến-lược-render)
- [5. Phân tích Roles & Tính năng](#5-phân-tích-roles--tính-năng)
  - [5.1. USER (Người mua)](#51-user-người-mua)
  - [5.2. MERCHANT (Người bán)](#52-merchant-người-bán)
  - [5.3. ADMIN (Quản trị viên)](#53-admin-quản-trị-viên)

---

## 1. Tổng quan dự án

### Mục tiêu

Xây dựng **sàn thương mại điện tử đa người bán (Multi-vendor Marketplace)**, lấy cảm hứng từ mô hình Shopee, với các mục tiêu cốt lõi:

- **Hiệu năng cao**: Tối ưu tốc độ tải trang, đạt điểm cao trên Core Web Vitals (LCP, FID, CLS).
- **SEO hàng đầu**: Đảm bảo mọi trang công khai (sản phẩm, danh mục, shop) đều được index tốt bởi các công cụ tìm kiếm.
- **Trải nghiệm người dùng mượt mà**: Giao diện hiện đại, tối giản, responsive trên mọi thiết bị.
- **Kiến trúc mở rộng**: Code base sạch, module hóa, dễ bảo trì và scale theo chiều ngang.

### Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────┐
│                   CLIENT (Next.js 14+)          │
│         App Router · SSG / ISR / SSR / CSR      │
├─────────────────────────────────────────────────┤
│                  REST API / WebSocket            │
├─────────────────────────────────────────────────┤
│              SERVER (Express / NestJS)           │
│       Auth · Products · Orders · Payments        │
├─────────────────────────────────────────────────┤
│              DATABASE (MongoDB + Mongoose)        │
│        Redis Cache · Cloudinary (Media)           │
└─────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer            | Công nghệ                        | Mục đích                                      |
| ---------------- | --------------------------------- | --------------------------------------------- |
| **Frontend**     | Next.js 14+ (App Router)         | Framework chính, hỗ trợ SSG/ISR/SSR/CSR       |
| **UI Library**   | React 18+                        | Component-based UI                             |
| **Styling**      | Tailwind CSS                     | Utility-first CSS, rapid prototyping           |
| **Backend**      | Node.js (Express hoặc NestJS)    | REST API, business logic                       |
| **Database**     | MongoDB (Mongoose ODM)           | NoSQL database, flexible schema                |
| **Payment**      | VNPAY Integration                | Cổng thanh toán nội địa                        |
| **Auth**         | JWT + OTP + OAuth2 (Social)      | Xác thực đa phương thức                       |
| **Real-time**    | Socket.IO                        | Theo dõi đơn hàng, thông báo real-time         |
| **Media**        | Cloudinary                       | Upload & tối ưu hình ảnh sản phẩm             |
| **Cache**        | Redis                            | Session, cache dữ liệu hot                    |
| **DevOps**       | Docker, GitHub Actions           | CI/CD, containerization                        |

---

## 3. Quy chuẩn UI/UX & Design System

### Bảng màu (Color Palette)

| Token              | Mã màu     | Mô tả                              |
| ------------------ | ---------- | ----------------------------------- |
| `--color-primary`  | `#FACC15`  | **Primary Yellow** — Vàng rực rỡ   |
| `--color-bg`       | `#FFFFFF`  | **Background White** — Nền trắng   |
| `--color-text`     | `#1F2937`  | Text chính — Xám đậm (Gray-800)    |
| `--color-text-sub` | `#6B7280`  | Text phụ — Xám nhạt (Gray-500)     |
| `--color-border`   | `#E5E7EB`  | Đường viền — Gray-200              |
| `--color-danger`   | `#EF4444`  | Cảnh báo / Lỗi — Đỏ               |
| `--color-success`  | `#22C55E`  | Thành công — Xanh lá               |
| `--color-accent`   | `#F59E0B`  | Accent — Amber-500                 |

### Typography

- **Font chính**: `Inter` (Google Fonts) — Clean, hiện đại, tối ưu cho readability.
- **Font phụ**: `system-ui, sans-serif` — Fallback nhanh.
- **Scale** (s: 14px (body) · 16pxubtitle) · 20-24px (heading) · 28-32px (hero).

### Phong cách thiết kế

- **Hiện đại & Tối giản**: Lấy bố cục tương tự Shopee nhưng **sạch sẽ hơn**, giảm clutter.
- **Rounded corners**: `border-radius: 8-12px` cho cards, buttons.
- **Shadow nhẹ**: `box-shadow` tinh tế tạo chiều sâu, tránh nặng nề.
- **Micro-animations**: Hover effects mượt mà (transition 200-300ms), skeleton loading.
- **Responsive**: Mobile-first, breakpoints: `sm(640) · md(768) · lg(1024) · xl(1280)`.
- **Spacing**: Hệ thống 4px grid (`4, 8, 12, 16, 20, 24, 32, 48, 64`).

---

## 4. Chiến lược Render

> [!IMPORTANT]
> Chiến lược render dưới đây là **bắt buộc tuân thủ** trong toàn bộ quá trình phát triển. Mọi thay đổi phải được review và phê duyệt.

| Chiến lược   | Trang áp dụng                                    | Lý do                                                                 |
| ------------ | ------------------------------------------------ | ---------------------------------------------------------------------- |
| **SSG/ISR**  | Trang chủ (Home)                                 | Nội dung ít thay đổi, tối ưu Core Web Vitals, cache tại CDN           |
| **SSG/ISR**  | Danh mục sản phẩm (Categories)                   | Cấu trúc danh mục ổn định, revalidate định kỳ (ISR 60-300s)          |
| **SSG/ISR**  | Blog / Tin tức                                   | Nội dung tĩnh, SEO tốt, build-time rendering                         |
| **SSR**      | Chi tiết sản phẩm (Product Detail)               | SEO bắt buộc, dữ liệu tồn kho & giá **luôn phải mới nhất**          |
| **SSR**      | Chi tiết Shop (Shop Profile)                     | SEO cho seller page, thông tin shop cập nhật real-time                 |
| **CSR**      | Giỏ hàng (Cart)                                  | Logic phức tạp phía client, không cần SEO                             |
| **CSR**      | Thanh toán (Checkout)                            | Bảo mật cao, xử lý payment flow phía client                          |
| **CSR**      | User Dashboard                                   | Dữ liệu cá nhân, không cần index                                     |
| **CSR**      | Merchant Dashboard                               | Quản lý shop, logic CRUD phức tạp                                     |
| **CSR**      | Admin Panel                                       | Nội bộ, bảo mật tối đa, không expose ra search engine                |

### Ghi chú kỹ thuật

- **SSG (Static Site Generation)**: HTML được generate tại build time → tốc độ tải nhanh nhất.
- **ISR (Incremental Static Regeneration)**: Kết hợp SSG + revalidate theo thời gian → cập nhật mà không cần re-deploy.
- **SSR (Server-Side Rendering)**: HTML render tại mỗi request → dữ liệu luôn mới nhất, SEO tốt.
- **CSR (Client-Side Rendering)**: Render hoàn toàn ở browser → phù hợp trang cần bảo mật, tương tác cao.

---

## 5. Phân tích Roles & Tính năng

### 5.1. USER (Người mua)

#### Xác thực & Tài khoản
- Đăng ký / Đăng nhập bằng **Email + OTP**
- Đăng nhập qua **Social Login** (Google, Facebook)
- Quản lý hồ sơ cá nhân (Avatar, Địa chỉ, SĐT)
- Quản lý sổ địa chỉ giao hàng (Thêm / Sửa / Xóa / Đặt mặc định)

#### Tìm kiếm & Duyệt sản phẩm
- Tìm kiếm sản phẩm **thông minh** (Autocomplete, Gợi ý, Lịch sử tìm kiếm)
- **Filter** nâng cao: Theo danh mục, khoảng giá, đánh giá, địa điểm, thương hiệu
- **Sort**: Theo giá (tăng/giảm), phổ biến nhất, mới nhất, bán chạy nhất
- Xem sản phẩm theo danh mục / shop

#### Giỏ hàng & Thanh toán
- Thêm / Xóa / Cập nhật số lượng sản phẩm trong giỏ hàng
- Chọn biến thể sản phẩm (Màu, Size, Phân loại)
- Áp dụng **Voucher / Mã giảm giá**
- Thanh toán đa phương thức:
  - 💳 **VNPAY** (ATM, Visa, MasterCard, QR Code)
  - 💵 **COD** (Thanh toán khi nhận hàng)

#### 📦 Theo dõi đơn hàng
- Xem lịch sử đơn hàng (Tất cả / Chờ xác nhận / Đang giao / Hoàn thành / Đã hủy)
- **Real-time tracking** trạng thái đơn hàng (WebSocket)
- Yêu cầu hủy đơn / Trả hàng / Hoàn tiền

#### Đánh giá & Nhận xét
- Đánh giá sản phẩm (1-5 sao) sau khi mua
- Viết nhận xét kèm **hình ảnh / video**
- Xem đánh giá của người mua khác (Filter theo số sao)

---

### 5.2. MERCHANT (Người bán)

#### Đăng ký & Quản lý gian hàng
- Đăng ký mở shop với quy trình **KYC** (Xác minh danh tính)
- Tùy chỉnh trang shop (Logo, Banner, Mô tả, Liên hệ)
- Xem trạng thái phê duyệt shop (Pending / Approved / Rejected)

#### Quản lý sản phẩm
- **Thêm** sản phẩm mới (Tên, Mô tả, Hình ảnh, Video)
- **Sửa** thông tin sản phẩm
- **Xóa** sản phẩm (Soft delete)
- **Phân loại** sản phẩm theo danh mục / tag
- Quản lý biến thể (SKU, Màu sắc, Kích cỡ, Giá từng biến thể)
- Upload hàng loạt sản phẩm (Bulk import via CSV/Excel)

#### Quản lý kho hàng
- Theo dõi tồn kho theo từng SKU / biến thể
- Cảnh báo hết hàng / sắp hết hàng (Low stock alert)
- Cập nhật số lượng tồn kho (Manual / Tự động trừ khi có đơn)

#### Xử lý đơn hàng
- Xem danh sách đơn hàng mới
- **Duyệt** đơn hàng (Xác nhận / Từ chối)
- Cập nhật trạng thái **giao hàng** (Đang đóng gói → Đã giao cho ĐVVC → Hoàn thành)
- Xử lý yêu cầu trả hàng / hoàn tiền

#### Quản lý Marketing
- Tạo **Voucher** giảm giá (% hoặc số tiền cố định)
- Thiết lập điều kiện áp dụng (Đơn tối thiểu, Danh mục, Thời hạn)
- Tạo **mã giảm giá** cho khách hàng thân thiết
- Quản lý Flash Sale / Chương trình khuyến mãi

#### Thống kê doanh thu
- Dashboard tổng quan (Doanh thu, Đơn hàng, Lượt xem)
- **Biểu đồ doanh thu** theo ngày / tuần / tháng / năm
- Báo cáo sản phẩm bán chạy nhất
- Phân tích tỷ lệ chuyển đổi (Conversion rate)

---

### 5.3. ADMIN (Quản trị viên)

#### Kiểm duyệt Merchant
- Xem danh sách yêu cầu mở shop mới
- **Phê duyệt** hoặc **Từ chối** đăng ký Merchant (kèm lý do)
- Xem tài liệu KYC của Merchant
- Tạm khóa / Mở khóa gian hàng vi phạm

#### Quản lý tập trung Users & Merchants
- Danh sách toàn bộ Users (Search, Filter, Phân trang)
- Danh sách toàn bộ Merchants (Trạng thái, Doanh thu, Đánh giá)
- **Ban / Unban** tài khoản vi phạm
- Xem chi tiết hoạt động của từng User / Merchant

#### Cấu hình hệ thống
- Cấu hình **phí sàn** (Commission rate %) cho từng danh mục
- Quản lý danh mục sản phẩm (Thêm / Sửa / Xóa / Sắp xếp)
- Cấu hình phương thức thanh toán
- Quản lý cài đặt chung (Tên sàn, Logo, Chính sách)

#### Báo cáo & Thống kê toàn hệ thống
- Tổng quan: Doanh thu, Số đơn, Users mới, Merchants mới
- Biểu đồ tăng trưởng theo thời gian
- Top Merchants theo doanh thu
- Top sản phẩm bán chạy toàn sàn
- Báo cáo doanh thu theo danh mục

#### Quản lý Banner & Quảng cáo
- CRUD **Banner** trang chủ (Hình ảnh, Link, Thứ tự hiển thị)
- Quản lý vị trí quảng cáo (Hero slider, Sidebar, Category banner)
- Lên lịch hiển thị banner (Ngày bắt đầu / Kết thúc)
- Thống kê lượt click / impression từng banner

---

## Ghi chú phiên bản

| Phiên bản | Ngày cập nhật | Ghi chú                               |
| --------- | ------------- | -------------------------------------- |
| v1.0      | 2026-05-12    | Khởi tạo tài liệu Source of Truth     |

---

> **Tài liệu này là Source of Truth cho dự án Nyan Market.**
> Mọi quyết định thiết kế và phát triển phải tuân thủ các quy chuẩn được mô tả ở đây.
> Cập nhật tài liệu khi có thay đổi lớn và thông báo cho toàn bộ team.
