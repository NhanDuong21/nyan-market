"use client";
/**
 * client/src/providers/AuthProvider.tsx
 * Professional Auth Provider with failsafe timeout and state synchronization.
 */

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getMe } from "@/services/auth.service";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isInitializing, setIsInitializing] = useState(true);
  const mounted = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations during HMR
    if (mounted.current) return;
    mounted.current = true;

    // Failsafe Timeout: Force stop loading after 5 seconds to prevent infinite spin
    const failsafeId = setTimeout(() => {
      console.warn("Auth initialization timed out. Forcing resolution.");
      setIsInitializing(false);
    }, 5000);

    const initAuth = async () => {
      // 1. Check real-time state via .getState() to avoid stale closures
      const currentState = useAuthStore.getState();
      if (currentState.isAuthenticated && currentState.user) {
        clearTimeout(failsafeId);
        setIsInitializing(false);
        return;
      }

      const token = localStorage.getItem("accessToken");
      
      // 2. Guest Path
      if (!token) {
        clearTimeout(failsafeId);
        setIsInitializing(false);
        return;
      }

      try {
        const response = await getMe();
        if (response?.data?.user) {
          setAuth(response.data.user);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        
        // Handle specific Auth errors
        const isAuthError = error instanceof Error && 
          (error.message.includes("401") || error.message.includes("403"));

        if (isAuthError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          clearAuth();
        }
      } finally {
        // 3. Resolve Loading
        clearTimeout(failsafeId);
        setIsInitializing(false);
      }
    };

    initAuth();

    return () => clearTimeout(failsafeId);
  }, [setAuth, clearAuth]);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-primary-100 opacity-75"></div>
          <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent shadow-md"></div>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
          Nyan Market
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
