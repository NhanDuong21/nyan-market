"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * MerchantGuard: Lớp bảo vệ tự phục hồi (Self-healing).
 * Sử dụng pathname làm dependency để ép buộc kiểm tra lại Auth khi điều hướng (giải quyết lỗi BFCache).
 */
export default function MerchantGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, setAuth, setIsInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname(); 
  const [isHealing, setIsHealing] = useState(false);

  useEffect(() => {
    const healAuth = async () => {
      // Nếu đã khởi tạo và đúng là merchant, không làm gì cả
      if (isInitialized && user?.roles?.includes("merchant")) {
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        // Không có token -> Đá về login
        router.replace("/login?redirect=/merchant/dashboard");
        return;
      }

      setIsHealing(true);
      try {
        console.log("[GUARD] Đang tự phục hồi phiên làm việc cho:", pathname);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setAuth(data.data.user, true);
          setIsInitialized(true);
          
          if (!data.data.user?.roles?.includes("merchant")) {
            router.replace("/merchant/register");
          }
        } else {
          throw new Error("Invalid token");
        }
      } catch (error) {
        console.error("[GUARD] Phục hồi thất bại:", error);
        localStorage.removeItem("accessToken");
        setAuth(null, false);
        setIsInitialized(true);
        router.replace("/login?redirect=/merchant/dashboard");
      } finally {
        setIsHealing(false);
      }
    };

    healAuth();
  }, [pathname, isInitialized, user, router, setAuth, setIsInitialized]);

  const isAuthorized = isInitialized && !!user && user.roles?.includes("merchant");

  // Hiển thị màn hình chờ nếu chưa authorized hoặc đang trong quá trình healing
  if (!isAuthorized || isHealing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Đang đồng bộ phiên làm việc...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
