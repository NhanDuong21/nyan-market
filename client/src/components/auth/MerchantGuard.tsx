"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * MerchantGuard: Lớp bảo vệ tự phục hồi (Self-healing) với Watchdog cơ chế.
 * Giải quyết triệt để lỗi treo BFCache khi điều hướng ngược.
 */
export default function MerchantGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, setAuth, setIsInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHealing, setIsHealing] = useState(false);
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);

  const isMerchant = user?.roles?.includes("merchant");
  const isAuthorized = isInitialized && !!user && isMerchant;

  const performHeal = useCallback(async (mounted: boolean) => {
    const currentState = useAuthStore.getState();
    
    // Nếu đã initialized và là merchant, thoát sớm
    if (currentState.isInitialized && currentState.user?.roles?.includes("merchant")) {
      if (mounted) setIsHealing(false);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAuth(null, false);
      setIsInitialized(true);
      if (mounted) {
        setIsHealing(false);
        router.replace("/login?redirect=" + encodeURIComponent(pathname));
      }
      return;
    }

    if (mounted) setIsHealing(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();
        setAuth(data.data.user, true);
        setIsInitialized(true);
        
        if (!data.data.user?.roles?.includes("merchant")) {
          if (mounted) router.replace("/merchant/register");
        }
      } else {
        throw new Error("Invalid Token");
      }
    } catch (error) {
      console.error("[GUARD] Lỗi tự phục hồi:", error);
      localStorage.removeItem("accessToken");
      setAuth(null, false);
      setIsInitialized(true);
      if (mounted) router.replace("/login");
    } finally {
      if (mounted) setIsHealing(false);
    }
  }, [pathname, router, setAuth, setIsInitialized]);

  useEffect(() => {
    let mounted = true;
    
    // Luôn chạy kiểm tra khi mount/remount/back-navigation
    performHeal(mounted);

    // Watchdog: Nếu sau 1.5s vẫn chưa initialized, kích hoạt lại
    watchdogRef.current = setTimeout(() => {
      if (!useAuthStore.getState().isInitialized && mounted) {
        console.warn("[GUARD] Watchdog triggered: Forcing re-heal.");
        performHeal(mounted);
      }
    }, 1500);

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && mounted) {
        console.log("[GUARD] BFCache detected, re-healing...");
        performHeal(mounted);
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => { 
      mounted = false; 
      window.removeEventListener("pageshow", handlePageShow);
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
    };
  }, [pathname, performHeal]);

  // Render logic
  return (
    <div className="relative h-full w-full">
      {/* 1. LỚP PHỦ CHẨN ĐOÁN (RADAR) */}
      {(!isAuthorized || isHealing) && (
        <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/95 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Đang đồng bộ phân quyền...</p>
          
          <div className="mt-8 min-w-[300px] rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-mono text-red-700 shadow-lg">
            <p className="mb-3 border-b border-red-200 pb-2 font-bold uppercase tracking-wider text-red-900 text-center">Radar Trạng Thái Zustand</p>
            <p className="mb-1">1. isInitialized: <span className="font-bold">{String(isInitialized)}</span></p>
            <p className="mb-1">2. hasUser: <span className="font-bold">{String(!!user)}</span></p>
            <p className="mb-1">3. isMerchant: <span className="font-bold">{String(isMerchant)}</span></p>
            <p className="mb-1">4. isHealing: <span className="font-bold">{String(isHealing)}</span></p>
            <p className="mt-3 text-[10px] text-gray-400 font-sans italic text-center">* Hệ thống đang cưỡng chế phục hồi trạng thái.</p>
          </div>
        </div>
      )}

      {/* 2. NỘI DUNG CHÍNH */}
      <div className={`h-full w-full transition-opacity duration-300 ${!isAuthorized || isHealing ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        {children}
      </div>
    </div>
  );
}
