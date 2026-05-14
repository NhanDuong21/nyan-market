"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * MerchantGuard: Lớp bảo vệ không trạng thái nội bộ (Zero Local State).
 * Giải quyết triệt để lỗi BFCache bằng cách dựa thuần túy vào trạng thái đồng bộ của Zustand.
 */
export default function MerchantGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, setAuth, setIsInitialized } = useAuthStore();
  const router = useRouter();

  // 1. ĐÁNH GIÁ ĐỒNG BỘ: Không có độ trễ, không bị kẹt bởi local state.
  const isMerchant = user?.role === "merchant" || user?.roles?.includes("merchant");
  const isAuthorized = isInitialized && isMerchant;

  useEffect(() => {
    // Nếu trạng thái đã được đồng bộ và hợp lệ, không làm gì cả.
    if (isInitialized) {
      if (!isMerchant) {
        router.replace("/merchant/register");
      }
      return;
    }

    // Tự phục hồi chỉ khi Zustand bị xóa (ví dụ: hard reload trên trang 404)
    const healAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login?redirect=/merchant/dashboard");
        return;
      }

      try {
        console.log("[GUARD] Đang cưỡng chế đồng bộ trạng thái...");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          const fetchedUser = data.data.user;
          setAuth(fetchedUser, true);
          setIsInitialized(true);

          const hasRight = fetchedUser?.role === "merchant" || fetchedUser?.roles?.includes("merchant");
          if (!hasRight) {
            router.replace("/merchant/register");
          }
        } else {
          throw new Error("Invalid Session");
        }
      } catch (error) {
        console.error("[GUARD] Đồng bộ thất bại:", error);
        localStorage.removeItem("accessToken");
        setAuth(null, false);
        setIsInitialized(true);
        router.replace("/login?redirect=/merchant/dashboard");
      }
    };

    healAuth();
  }, [isInitialized, isMerchant, router, setAuth, setIsInitialized]);

  return (
    <div className="relative h-full w-full">
      {/* 2. LOADING SPINNER: Gắn chặt vào trạng thái Zustand. Nó sẽ biến mất ngay lập tức nếu isAuthorized là true. */}
      {!isAuthorized && (
        <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/95 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Đang chuẩn bị không gian làm việc...</p>
        </div>
      )}

      {/* 3. CSS OPACITY: Đảm bảo children không bao giờ bị unmount khỏi Virtual DOM của Next.js */}
      <div className={`h-full w-full transition-opacity duration-300 ${!isAuthorized ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        {children}
      </div>
    </div>
  );
}
