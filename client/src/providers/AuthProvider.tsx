"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setAuth, setIsInitialized, isInitialized } = useAuthStore();
  const initAttempted = useRef(false);

  useEffect(() => {
    // Nếu đã initialized qua cơ chế khác (ví dụ MerchantGuard) thì không chạy lại init nặng
    // Nhưng vẫn phải đảm bảo effect này kết thúc êm đẹp
    if (isInitialized && initAttempted.current) return;
    
    initAttempted.current = true;

    const initAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setAuth(null, false);
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setAuth(data.data.user, true);
        } else {
          localStorage.removeItem("accessToken");
          setAuth(null, false);
        }
      } catch (error) {
        console.error("Lỗi khởi tạo Auth:", error);
        // Không xóa token ở đây vì có thể do mạng lag, server sập tạm thời
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();

    // Failsafe: Sau 2 giây nếu chưa xong cũng phải mở cửa
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().isInitialized) {
        console.warn("[AUTH] Failsafe triggered: Forced initialization.");
        setIsInitialized(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isInitialized, setAuth, setIsInitialized]);

  return <>{children}</>;
}
