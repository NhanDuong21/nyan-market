"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * MerchantGuard: Lớp bảo vệ kết hợp 2 giải pháp tối thượng.
 * 1. Zero Local State: Loại bỏ hoàn toàn useState để tránh bẫy closure.
 * 2. Native BFCache Killer: Sử dụng sự kiện pageshow để phá vỡ việc đóng băng useEffect của Next.js.
 */
export default function MerchantGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, setAuth, setIsInitialized } = useAuthStore();
  const router = useRouter();

  // 1. TRẠNG THÁI RENDER ĐỒNG BỘ (Không sử dụng local state)
  const isMerchant = user?.role === "merchant" || user?.roles?.includes("merchant");
  const isAuthorized = isInitialized && !!user && isMerchant;

  useEffect(() => {
    const heal = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login?redirect=/merchant/dashboard");
        return;
      }

      try {
        console.log("[GUARD] Đang thực hiện tự phục hồi xác thực...");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store" // Quan trọng: Bỏ qua bộ nhớ đệm fetch của Next.js
        });

        if (res.ok) {
          const data = await res.json();
          setAuth(data.data.user, true);
          setIsInitialized(true);
          
          const hasRight = data.data.user?.role === "merchant" || data.data.user?.roles?.includes("merchant");
          if (!hasRight) {
            router.replace("/merchant/register");
          }
        } else {
          throw new Error("Invalid Session");
        }
      } catch (error) {
        console.error("[GUARD] Lỗi khôi phục xác thực:", error);
        localStorage.removeItem("accessToken");
        setAuth(null, false);
        setIsInitialized(true);
        router.replace("/login?redirect=/merchant/dashboard");
      }
    };

    // Kích hoạt 1: Mount bình thường hoặc Hard Reload (Zustand bị trống)
    if (!isInitialized) {
      heal();
    } else if (isInitialized && !isMerchant) {
      router.replace("/merchant/register");
    }

    // Kích hoạt 2: BFCache Killer (Người dùng nhấn nút Back)
    // Phá vỡ chu kỳ useEffect bị đóng băng của Next.js khi quay lại từ trang 404.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted || !useAuthStore.getState().isInitialized) {
        console.log("[GUARD] Phát hiện BFCache hoặc mất trạng thái, đang tự phục hồi...");
        heal();
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [isInitialized, isMerchant, router, setAuth, setIsInitialized]);

  return (
    <div className="relative h-full w-full">
      {/* Spinner được liên kết trực tiếp với Zustand: Biến mất ngay khi isAuthorized là true */}
      {!isAuthorized && (
        <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/95 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Đang chuẩn bị không gian làm việc...</p>
        </div>
      )}

      {/* Giữ nguyên cấu trúc DOM để ổn định Router Cache của Next.js */}
      <div className={`h-full w-full transition-opacity duration-300 ${!isAuthorized ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        {children}
      </div>
    </div>
  );
}
