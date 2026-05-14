"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * MerchantGuard: Lớp bảo vệ nâng cao với cơ chế "Heartbeat Failsafe".
 * Giải quyết triệt để lỗi Next.js 14 đóng băng lifecycle khi điều hướng ngược (BFCache).
 */
export default function MerchantGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, setAuth, setIsInitialized } = useAuthStore();
  const router = useRouter();

  // Đánh giá đồng bộ, tránh bẫy local state
  const isMerchant = user?.role === "merchant" || user?.roles?.includes("merchant");
  const isAuthorized = isInitialized && !!user && isMerchant;

  useEffect(() => {
    let isHealingInProgress = false;

    const heal = async () => {
      // Ngăn chặn các đợt fetch chồng chéo hoặc khi đã initialized
      if (isHealingInProgress || useAuthStore.getState().isInitialized) return;

      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login?redirect=/merchant/dashboard");
        return;
      }

      isHealingInProgress = true;
      try {
        console.log("[GUARD] Đang cưỡng chế khôi phục trạng thái...");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        
        // CACHE BUSTER: Gắn timestamp để phá hủy hoàn toàn cơ chế cache của Next.js fetch
        const res = await fetch(`${apiUrl}/auth/me?_t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store" 
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
        console.error("[GUARD] Lỗi failsafe:", error);
        localStorage.removeItem("accessToken");
        setAuth(null, false);
        setIsInitialized(true);
        router.replace("/login?redirect=/merchant/dashboard");
      } finally {
        isHealingInProgress = false;
      }
    };

    // 1. Kích hoạt mount tiêu chuẩn
    if (!isInitialized) {
      heal();
    } else if (isInitialized && !isMerchant) {
      router.replace("/merchant/register");
    }

    // 2. CƠ CHẾ HEARTBEAT FAILSAFE
    // Next.js Router Cache có thể đóng băng component. setInterval vẫn sẽ chạy bất kể đóng băng.
    const heartbeat = setInterval(() => {
      if (!useAuthStore.getState().isInitialized && localStorage.getItem("accessToken")) {
        console.warn("[GUARD] Phát hiện BFCache treo. Kích hoạt Heartbeat Failsafe!");
        heal();
      }
    }, 500);

    return () => clearInterval(heartbeat);
  }, [isInitialized, isMerchant, router, setAuth, setIsInitialized]);

  return (
    <div className="relative h-full w-full">
      {!isAuthorized && (
        <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/95 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Đang khôi phục không gian làm việc...</p>
        </div>
      )}

      {/* Giữ nguyên DOM để tồn tại qua các đợt Router Cache của Next.js */}
      <div className={`h-full w-full transition-opacity duration-300 ${!isAuthorized ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        {children}
      </div>
    </div>
  );
}
