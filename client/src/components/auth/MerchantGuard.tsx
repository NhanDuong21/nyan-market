"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * MerchantGuard: Lớp bảo vệ tiêu chuẩn.
 * Chấp nhận hy sinh trường hợp BFCache 404 để giữ kiến trúc mã nguồn sạch sẽ.
 */
export default function MerchantGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Chỉ thực hiện kiểm tra khi hệ thống Auth toàn cục đã khởi tạo xong
    if (!isInitialized) return;

    const isMerchant = user?.role === "merchant" || user?.roles?.includes("merchant");
    
    if (!user) {
      // Nếu chưa đăng nhập -> Chuyển hướng về Login
      router.replace("/login?redirect=/merchant/dashboard");
    } else if (!isMerchant) {
      // Nếu đã đăng nhập nhưng không phải merchant -> Yêu cầu đăng ký Shop
      router.replace("/merchant/register");
    }
  }, [isInitialized, user, router]);

  // 1. Hiển thị vòng xoay đơn giản khi chưa khởi tạo xong
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // 2. Khóa UI nếu không thỏa mãn điều kiện (Tránh Layout bị hiển thị nhầm trước khi Redirect)
  const isMerchant = user?.role === "merchant" || user?.roles?.includes("merchant");
  if (!user || !isMerchant) return null;

  return <>{children}</>;
}
