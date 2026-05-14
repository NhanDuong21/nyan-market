"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function MerchantGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, setAuth, setIsInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHealing, setIsHealing] = useState(false);

  const isMerchant = user?.roles?.includes("merchant");
  const isAuthorized = isInitialized && !!user && isMerchant;

  useEffect(() => {
    let mounted = true;

    const selfHealAuth = async () => {
      // FIX: Read current state directly from Zustand to avoid dependency loop closures
      const currentState = useAuthStore.getState();
      if (currentState.isInitialized && currentState.user?.roles?.includes("merchant")) return;

      const token = localStorage.getItem("accessToken");
      if (!token) {
        if (mounted) router.replace("/login?redirect=/merchant/dashboard");
        return;
      }

      if (mounted) setIsHealing(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
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
        localStorage.removeItem("accessToken");
        setAuth(null, false);
        setIsInitialized(true);
        if (mounted) router.replace("/login?redirect=/merchant/dashboard");
      } finally {
        // Now this will ALWAYS run because the effect doesn't prematurely unmount!
        if (mounted) setIsHealing(false);
      }
    };

    selfHealAuth();

    return () => { mounted = false; };
  }, [pathname, router, setAuth, setIsInitialized]); // STRICTLY REMOVED isInitialized and user from deps!

  return (
    <div className="relative h-full w-full">
      {(!isAuthorized || isHealing) && (
        <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/95 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Đang đồng bộ phân quyền...</p>
          
          {/* Diagnostic Radar */}
          <div className="mt-8 min-w-[300px] rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-mono text-red-700 shadow-lg">
            <p className="mb-3 border-b border-red-200 pb-2 font-bold uppercase tracking-wider text-red-900">Radar Trạng Thái Zustand</p>
            <p className="mb-1">1. isInitialized: <span className="font-bold">{String(isInitialized)}</span></p>
            <p className="mb-1">2. hasUser: <span className="font-bold">{String(!!user)}</span></p>
            <p className="mb-1">3. isMerchant: <span className="font-bold">{String(isMerchant)}</span></p>
            <p className="mb-1">4. isHealing: <span className="font-bold">{String(isHealing)}</span></p>
          </div>
        </div>
      )}

      <div className={`h-full w-full transition-opacity duration-300 ${!isAuthorized || isHealing ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        {children}
      </div>
    </div>
  );
}
