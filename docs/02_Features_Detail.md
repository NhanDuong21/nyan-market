<!-- // docs/02_Features_Detail.md -->

# Nyan Market — Đặc tả nghiệp vụ chi tiết (Features Detail)

> Tài liệu kim chỉ nam cho thiết kế Database Schema và API.
> Mọi luồng nghiệp vụ, logic và edge cases được mô tả tại đây.

---

## Mục lục

- [1. USER — Khách hàng](#1-user--khách-hàng)
  - [1.1. Xác thực (OTP Email)](#11-xác-thực-otp-email)
  - [1.2. Giỏ hàng & Thanh toán](#12-giỏ-hàng--thanh-toán)
  - [1.3. Dashboard cá nhân](#13-dashboard-cá-nhân)
- [2. MERCHANT — Người bán](#2-merchant--người-bán)
  - [2.1. Onboarding](#21-onboarding)
  - [2.2. Quản lý sản phẩm & Kho](#22-quản-lý-sản-phẩm--kho)
  - [2.3. Vận hành & Voucher](#23-vận-hành--voucher)
  - [2.4. Dashboard kinh doanh](#24-dashboard-kinh-doanh)
- [3. ADMIN — Quản trị viên](#3-admin--quản-trị-viên)
  - [3.1. Kiểm duyệt & Quản lý](#31-kiểm-duyệt--quản-lý)
  - [3.2. Dashboard hệ thống](#32-dashboard-hệ-thống)

---

## 1. USER — Khách hàng

### 1.1. Xác thực (OTP Email)

#### User Flow

```
[Nhập Email] → [Gửi OTP đến Email] → [Nhập OTP (6 số)] → [Xác thực thành công]
                                                                    ↓
                                                          [Thiết lập mật khẩu]
                                                                    ↓
                                                          [Tạo tài khoản hoàn tất]
```

#### Input / Output

| Bước | Input | Output | Ghi chú |
|------|-------|--------|---------|
| Gửi OTP | `email: string` | `{ success, message, otpExpiry }` | OTP 6 số, hết hạn sau **5 phút** |
| Xác thực OTP | `email, otp: string` | `{ success, tempToken }` | `tempToken` dùng cho bước đặt mật khẩu |
| Đặt mật khẩu | `tempToken, password, confirmPassword` | `{ success, accessToken, refreshToken }` | Password >= 8 ký tự, chứa chữ + số |
| Social Login | `provider: 'google' \| 'facebook'` | `{ success, accessToken, refreshToken, isNewUser }` | Nếu `isNewUser = true` → redirect setup profile |

#### Edge Cases

> **OTP hết hạn**: OTP chỉ có hiệu lực trong **5 phút**. Sau khi hết hạn, trả về lỗi `OTP_EXPIRED` và yêu cầu gửi lại.

> **Rate Limit gửi OTP**: Tối đa **3 lần gửi OTP / email / 15 phút**. Vượt quá → block và trả lỗi `OTP_RATE_LIMITED` kèm `retryAfter` (timestamp).

> **Email đã tồn tại**: Nếu email đã đăng ký → trả lỗi `EMAIL_ALREADY_EXISTS`, gợi ý đăng nhập hoặc quên mật khẩu.

> **OTP sai quá 5 lần**: Khóa xác thực OTP cho email đó trong **30 phút** → `OTP_BLOCKED`.

---

### 1.2. Giỏ hàng & Thanh toán

#### User Flow

```
[Thêm SP vào giỏ] → [Xem giỏ hàng] → [Chọn SP cần mua] → [Áp Voucher]
                                                                  ↓
                                                        [Chọn địa chỉ giao]
                                                                  ↓
                                                     [Chọn phương thức thanh toán]
                                                        ↙                ↘
                                                    [COD]              [VNPAY]
                                                      ↓                  ↓
                                              [Đặt hàng thành công]  [Redirect VNPAY Gateway]
                                                                         ↓
                                                                  [Callback → Xác nhận]
```

#### Logic tính tiền

```
Tổng tiền đơn hàng = Σ (Đơn giá × Số lượng) cho từng item
Tiền giảm giá      = apply(Voucher, Tổng tiền đơn hàng)
Phí vận chuyển      = calculateShipping(địa chỉ, trọng lượng, đơn vị vận chuyển)
─────────────────────────────────────────────────────────
Tổng thanh toán     = Tổng tiền đơn hàng - Tiền giảm giá + Phí vận chuyển
```

#### Input / Output

| Bước | Input | Output |
|------|-------|--------|
| Thêm vào giỏ | `productId, variantId, quantity` | `{ cart: CartItem[] }` |
| Cập nhật số lượng | `cartItemId, quantity` | `{ updatedItem, cartTotal }` |
| Áp Voucher | `voucherCode, cartItems[]` | `{ discount, finalTotal, voucherInfo }` |
| Checkout (COD) | `cartItemIds[], addressId, voucherCode?` | `{ orderId, status: 'pending_confirmation' }` |
| Checkout (VNPAY) | `cartItemIds[], addressId, voucherCode?` | `{ paymentUrl, orderId, txnRef }` |
| VNPAY Callback | `vnp_ResponseCode, vnp_TxnRef, vnp_Amount, checksum` | `{ orderId, status: 'paid' \| 'failed' }` |

#### Payment Flow chi tiết

**COD (Cash On Delivery):**
1. User bấm "Đặt hàng" → Tạo Order với `paymentMethod: 'COD'`, `paymentStatus: 'unpaid'`
2. Order status → `pending_confirmation` (chờ Merchant duyệt)
3. Khi giao hàng thành công → `paymentStatus: 'paid'`

**VNPAY:**
1. User bấm "Thanh toán" → Server tạo `paymentUrl` với VNPAY SDK
2. Redirect user đến VNPAY Gateway
3. User thanh toán → VNPAY gửi callback (IPN) đến server
4. Server verify checksum + `vnp_ResponseCode === '00'` → `paymentStatus: 'paid'`
5. Nếu thất bại → `paymentStatus: 'failed'`, cho phép thanh toán lại trong **15 phút**

#### Edge Cases

> **Sản phẩm hết hàng khi checkout**: Tại thời điểm bấm "Đặt hàng", server **re-check tồn kho** cho từng item. Nếu `stock < requestedQty` → trả lỗi `INSUFFICIENT_STOCK` kèm `{ productId, available, requested }`. **Sử dụng Optimistic Locking** (version field) trên document tồn kho để tránh race condition.

> **Voucher hết lượt sử dụng**: Server kiểm tra `voucher.usedCount < voucher.maxUsage` tại thời điểm tạo đơn. Nếu hết → `VOUCHER_EXHAUSTED`. **Dùng atomic operation** `$inc` để tránh overselling voucher.

> **Voucher hết hạn**: Check `voucher.endDate > now()`. Nếu hết hạn → `VOUCHER_EXPIRED`.

> **VNPAY timeout**: Nếu user không hoàn tất thanh toán trong **15 phút**, order tự chuyển sang `cancelled` và **hoàn lại tồn kho** (scheduled job).

> **Double payment**: Kiểm tra `txnRef` unique. Nếu callback trùng → ignore, trả `{ already_processed: true }`.

---

### 1.3. Dashboard cá nhân

#### Input / Output

| Thành phần | Input | Output | Loại biểu đồ |
|------------|-------|--------|---------------|
| Lịch sử đơn hàng | `userId, status?, page, limit` | `{ orders[], total, currentPage }` | Table + Pagination |
| Trạng thái đơn hàng | `userId` | `{ pending, shipping, completed, cancelled, returned }` | **Pie Chart** |
| Tổng chi tiêu | `userId, period: 'month' \| 'year'` | `{ data: [{ date, amount }], totalSpent }` | **Area Chart** |
| Shop yêu thích | `userId, page, limit` | `{ shops[], total }` | Grid Cards |
| Đơn hàng real-time | `orderId` (WebSocket) | `{ status, updatedAt, location? }` | Timeline Tracker |

#### Trạng thái đơn hàng (Order Status Flow)

```
pending_confirmation → confirmed → processing → shipping → delivered → completed
        ↓                                          ↓            ↓
    cancelled                                  returned    return_requested
```

---

## 2. MERCHANT — Người bán

### 2.1. Onboarding

#### User Flow

```
[Đăng ký tài khoản User] → [Bấm "Đăng ký bán hàng"]
        ↓
[Điền thông tin Shop]
  - Tên shop, Mô tả, Địa chỉ kho
  - Số điện thoại liên hệ
        ↓
[Upload tài liệu KYC]
  - CCCD/CMND (mặt trước + sau)
  - Giấy phép kinh doanh (nếu có)
  - Ảnh mặt bằng/kho hàng
        ↓
[Submit → Status: PENDING]
        ↓
[Admin review] → APPROVED / REJECTED (kèm lý do)
        ↓
[Nếu APPROVED → Kích hoạt Merchant Dashboard]
```

#### Input / Output

| Bước | Input | Output |
|------|-------|--------|
| Tạo Shop | `shopName, description, address, phone, categoryIds[]` | `{ shopId, status: 'pending' }` |
| Upload KYC | `shopId, idCardFront, idCardBack, businessLicense?, storePhotos[]` | `{ kycId, uploadedAt }` |
| Kiểm tra trạng thái | `shopId` | `{ status: 'pending' \| 'approved' \| 'rejected', reason? }` |

#### Edge Cases

> **Tên shop trùng lặp**: Check unique `shopName` (case-insensitive). Trùng → `SHOP_NAME_EXISTS`.

> **File upload không hợp lệ**: Chỉ chấp nhận `jpg/png/pdf`, tối đa **5MB/file**. Sai định dạng → `INVALID_FILE_FORMAT`.

> **Merchant bị từ chối**: Cho phép sửa thông tin và **nộp lại tối đa 3 lần**. Quá 3 lần → phải liên hệ Support.

---

### 2.2. Quản lý sản phẩm & Kho

#### Logic tồn kho (Inventory)

```
Khi có đơn hàng mới (status: confirmed):
  stock = stock - orderedQuantity     // Atomic: $inc: { stock: -qty }

Khi đơn hàng bị hủy / trả hàng:
  stock = stock + returnedQuantity    // Atomic: $inc: { stock: +qty }

Cảnh báo:
  if (stock <= lowStockThreshold) → Push notification "Sắp hết hàng"
  if (stock === 0) → Tự động ẩn sản phẩm khỏi storefront
```

#### Input / Output

| Thao tác | Input | Output |
|----------|-------|--------|
| Thêm SP | `name, description, price, categoryId, images[], variants[]` | `{ productId, status: 'active' }` |
| Sửa SP | `productId, updatedFields` | `{ product: updated }` |
| Xóa SP | `productId` | `{ success, deletedAt }` — Soft delete (`isDeleted: true`) |
| Cập nhật tồn kho | `productId, variantId?, newStock` | `{ productId, stock: newStock }` |
| Xem tồn kho | `shopId, filter?, page, limit` | `{ products[], lowStockCount, outOfStockCount }` |

#### Cấu trúc Variant

```json
{
  "productId": "ObjectId",
  "variants": [
    {
      "sku": "NYM-SHIRT-RED-M",
      "attributes": { "color": "Đỏ", "size": "M" },
      "price": 250000,
      "stock": 50,
      "images": ["url1"]
    }
  ]
}
```

#### Edge Cases

> **Cập nhật tồn kho concurrent**: Sử dụng **Mongoose `__v` (version key)** hoặc `findOneAndUpdate` với `$inc` để đảm bảo atomic operation, tránh race condition khi nhiều đơn hàng cùng trừ kho.

> **Sản phẩm có đơn hàng đang xử lý**: Không cho phép xóa (kể cả soft delete) nếu có đơn hàng ở trạng thái `confirmed` hoặc `shipping` → `PRODUCT_HAS_ACTIVE_ORDERS`.

> **Upload ảnh sản phẩm**: Tối đa **9 ảnh + 1 video** / sản phẩm. Ảnh resize về `800x800` và tạo thumbnail `200x200`. Dùng **Cloudinary** transformation.

---

### 2.3. Vận hành & Voucher

#### Logic tạo Voucher

```
Voucher {
  code: string (unique, uppercase, 6-12 ký tự)
  type: 'percentage' | 'fixed_amount'
  value: number                    // 10 (= 10%) hoặc 50000 (= 50.000đ)
  maxDiscount?: number             // Giảm tối đa (cho type percentage)
  minOrderValue: number            // Đơn tối thiểu để áp dụng
  maxUsage: number                 // Tổng lượt sử dụng
  maxUsagePerUser: number          // Lượt / user
  usedCount: number                // Đếm atomic
  startDate: Date
  endDate: Date
  applicableCategories?: ObjectId[] // Null = tất cả
  shopId: ObjectId                 // Voucher thuộc shop nào
  status: 'active' | 'inactive' | 'expired'
}
```

#### Validation khi áp dụng Voucher

| Rule | Điều kiện | Lỗi trả về |
|------|-----------|-------------|
| Thời hạn | `now() < startDate` hoặc `now() > endDate` | `VOUCHER_NOT_ACTIVE` |
| Lượt dùng | `usedCount >= maxUsage` | `VOUCHER_EXHAUSTED` |
| Lượt / user | `userUsageCount >= maxUsagePerUser` | `VOUCHER_USER_LIMIT_REACHED` |
| Đơn tối thiểu | `orderTotal < minOrderValue` | `ORDER_BELOW_MINIMUM` |
| Danh mục | Cart items không thuộc `applicableCategories` | `VOUCHER_CATEGORY_MISMATCH` |
| Shop | Voucher shop A áp cho đơn shop B | `VOUCHER_SHOP_MISMATCH` |

#### Edge Cases

> **Voucher code trùng**: `code` là unique index. Nếu Merchant tạo code đã tồn tại → `VOUCHER_CODE_EXISTS`. Hệ thống cung cấp nút **"Tạo mã ngẫu nhiên"**.

> **Chỉnh sửa voucher đang active**: Chỉ cho phép sửa `maxUsage`, `endDate`. Không cho sửa `value`, `type`, `code` khi đã có người dùng → `VOUCHER_MODIFICATION_RESTRICTED`.

---

### 2.4. Dashboard kinh doanh

#### Input / Output

| Metric | Input | Output | Công thức / Biểu đồ |
|--------|-------|--------|----------------------|
| Doanh thu thuần | `shopId, startDate, endDate` | `{ netRevenue, grossRevenue, commission }` | `netRevenue = grossRevenue - platformCommission - refunds` |
| AOV | `shopId, period` | `{ aov, totalOrders, totalRevenue }` | `AOV = totalRevenue / totalOrders` |
| Tăng trưởng doanh số | `shopId, period: 'day' \| 'month'` | `{ data: [{ date, revenue, orders }] }` | **Line/Bar Chart** |
| SP bán chạy | `shopId, limit` | `{ products: [{ name, sold, revenue }] }` | **Horizontal Bar Chart** |
| Tỷ lệ hoàn đơn | `shopId, period` | `{ returnRate, totalReturns, totalOrders }` | `returnRate = (totalReturns / totalOrders) * 100` |

---

## 3. ADMIN — Quản trị viên

### 3.1. Kiểm duyệt & Quản lý

#### Logic phê duyệt Merchant

```
Admin actions:
  APPROVE → merchant.status = 'active'
          → Gửi email thông báo + kích hoạt Merchant Dashboard
          → Log: { action: 'approve', adminId, merchantId, timestamp }

  REJECT  → merchant.status = 'rejected'
          → Gửi email kèm lý do từ chối
          → Log: { action: 'reject', adminId, merchantId, reason, timestamp }
```

#### Logic Ban User/Merchant

```
BAN:
  user.status = 'banned'
  user.banReason = reason
  user.bannedAt = now()
  user.bannedBy = adminId
  → Invalidate tất cả sessions/tokens của user
  → Nếu là Merchant: ẩn toàn bộ sản phẩm, tạm dừng đơn hàng đang xử lý

UNBAN:
  user.status = 'active'
  user.banReason = null
  → Khôi phục sản phẩm (nếu Merchant)
  → Log action
```

#### Input / Output

| Thao tác | Input | Output |
|----------|-------|--------|
| Duyệt Merchant | `merchantId, action: 'approve' \| 'reject', reason?` | `{ merchant, newStatus }` |
| Ban User | `userId, reason, duration?: number` | `{ userId, status: 'banned', bannedUntil? }` |
| Unban User | `userId` | `{ userId, status: 'active' }` |
| Danh sách Users | `search?, status?, role?, page, limit, sortBy` | `{ users[], total, page }` |
| Danh sách Merchants | `status?, page, limit` | `{ merchants[], total, pendingCount }` |

#### Edge Cases

> **Ban Merchant có đơn đang giao**: Đơn hàng ở trạng thái `shipping` vẫn được hoàn tất. Chỉ block đơn mới và đơn `pending_confirmation`. Admin nhận cảnh báo `MERCHANT_HAS_ACTIVE_ORDERS` trước khi ban.

> **Admin tự ban chính mình**: Không cho phép. Server check `adminId !== targetUserId` → `CANNOT_BAN_SELF`.

> **Ban có thời hạn**: Nếu `duration` được set (tính bằng giờ), hệ thống tự động unban qua **scheduled job** khi hết hạn.

---

### 3.2. Dashboard hệ thống

#### Input / Output

| Metric | Input | Output | Biểu đồ |
|--------|-------|--------|----------|
| GMV | `period: 'day' \| 'month' \| 'year'` | `{ gmv, previousPeriodGmv, growthRate }` | **KPI Card** + **Area Chart** |
| Tỷ lệ chuyển đổi | `period` | `{ conversionRate, visitors, buyers }` | **Gauge Chart** |
| Người dùng mới | `period, groupBy: 'day' \| 'week'` | `{ data: [{ date, newUsers, newMerchants }] }` | **Stacked Bar Chart** |
| Revenue breakdown | `period` | `{ totalCommission, totalGmv, byCategory[] }` | **Donut Chart** |
| Top Merchants | `period, limit` | `{ merchants: [{ name, revenue, orders, rating }] }` | **Table** + Ranking |

#### Công thức chính

```
GMV             = Σ (giá trị tất cả đơn hàng completed trên toàn sàn)
Platform Revenue = Σ (GMV * commissionRate cho từng category)
Growth Rate     = ((currentPeriod - previousPeriod) / previousPeriod) * 100
Conversion Rate = (totalBuyers / totalVisitors) * 100
```

---

## Phụ lục: Bảng mã lỗi (Error Codes)

| Code | HTTP Status | Mô tả |
|------|-------------|--------|
| `OTP_EXPIRED` | 400 | OTP đã hết hạn (> 5 phút) |
| `OTP_RATE_LIMITED` | 429 | Gửi OTP quá nhiều lần |
| `OTP_BLOCKED` | 403 | Nhập sai OTP quá 5 lần |
| `EMAIL_ALREADY_EXISTS` | 409 | Email đã được đăng ký |
| `INSUFFICIENT_STOCK` | 409 | Sản phẩm không đủ tồn kho |
| `VOUCHER_EXHAUSTED` | 410 | Voucher đã hết lượt sử dụng |
| `VOUCHER_EXPIRED` | 410 | Voucher đã hết hạn |
| `VOUCHER_NOT_ACTIVE` | 400 | Voucher chưa đến ngày áp dụng |
| `VOUCHER_USER_LIMIT_REACHED` | 403 | User đã dùng hết lượt voucher |
| `ORDER_BELOW_MINIMUM` | 400 | Đơn chưa đạt giá trị tối thiểu |
| `VOUCHER_SHOP_MISMATCH` | 400 | Voucher không thuộc shop này |
| `VOUCHER_CODE_EXISTS` | 409 | Mã voucher đã tồn tại |
| `SHOP_NAME_EXISTS` | 409 | Tên shop đã tồn tại |
| `INVALID_FILE_FORMAT` | 400 | File upload sai định dạng |
| `PRODUCT_HAS_ACTIVE_ORDERS` | 409 | SP có đơn đang xử lý |
| `MERCHANT_HAS_ACTIVE_ORDERS` | 409 | Merchant có đơn đang giao |
| `CANNOT_BAN_SELF` | 403 | Admin không thể tự ban |
| `VOUCHER_MODIFICATION_RESTRICTED` | 403 | Không thể sửa voucher đang active |

---

## Ghi chú phiên bản

| Phiên bản | Ngày cập nhật | Ghi chú |
|-----------|---------------|---------|
| v1.0 | 2026-05-12 | Khởi tạo đặc tả nghiệp vụ chi tiết |

---

> **Tài liệu này phải được tham chiếu khi thiết kế Database Schema và API Endpoints.**
> Mọi edge case đã liệt kê phải được implement trong code validation layer.
