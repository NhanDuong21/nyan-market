"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setAuth, setIsInitialized, isInitialized } = useAuthStore();

  useEffect(() => {
    // [CHỐT CHẶN TỐI THƯỢNG]: Nếu đã khởi tạo rồi thì tuyệt đối không chạy lại.
    // Điều này vô hiệu hóa hoàn toàn sự phá bĩnh của React 18 Strict Mode!
    if (isInitialized) return;

    const initAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setAuth(null, false);
          return;
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
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
        setAuth(null, false);
      } finally {
        // [QUAN TRỌNG NHẤT]: XÓA BỎ IF(MOUNTED).
        // Zustand là State toàn cục, được phép cập nhật mọi lúc mọi nơi kể cả khi component đã bị unmount!
        setIsInitialized(true);
      }
    };

    initAuth();

    // Hẹn giờ 3 giây: Mạng lag, server sập cũng phải mở cửa cho Layout chạy!
    const failsafe = setTimeout(() => {
      setIsInitialized(true);
    }, 3000);

    return () => clearTimeout(failsafe);
  }, [isInitialized, setAuth, setIsInitialized]);

  return <>{children}</>;
}
