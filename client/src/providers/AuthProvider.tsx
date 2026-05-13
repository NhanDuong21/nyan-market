"use client";
/**
 * client/src/providers/AuthProvider.tsx
 * Non-blocking Auth Provider to resolve infinite spinner issues.
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
  const setInitialized = useAuthStore((state) => state.setInitialized);
  
  // We use a local ref to track if we've already tried to initialize
  // This persists across re-renders but not hard refreshes.
  const hasInitialized = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log("[AUTH DEBUG] Initializing Auth Session...");

    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        console.log("[AUTH DEBUG] No token, guest mode.");
        setIsInitializing(false);
        setInitialized(true);
        return;
      }

      try {
        const response = await getMe();
        if (response?.data?.user) {
          console.log("[AUTH DEBUG] Session restored for:", response.data.user.email);
          setAuth(response.data.user);
        }
      } catch (error) {
        console.error("[AUTH DEBUG] Session restoration failed (likely expired or server down).");
      } finally {
        setIsInitializing(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, [setAuth, clearAuth, setInitialized]);

  // FIX: We no longer return a full-screen blocking div.
  // Instead, we always render the children.
  // This prevents the "infinite spinner" trap.
  return (
    <>
      {/* Subtle top-bar loading indicator if needed, or nothing */}
      {isInitializing && (
        <div className="fixed top-0 left-0 right-0 z-[10000] h-1 bg-primary-400 animate-pulse"></div>
      )}
      {children}
    </>
  );
}
