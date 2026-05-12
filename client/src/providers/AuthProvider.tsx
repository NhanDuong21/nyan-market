"use client";
// client/src/components/auth/AuthProvider.tsx

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const response = await getMe();
        if (response.data?.user) {
          setAuth(response.data.user);
        }
      } catch (error) {
        console.error("Auto login failed:", error);
        // Clear stale data on failure
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [setAuth, clearAuth]);

  // If we're still checking auth status, we can show a global loader
  // or just return null to prevent flickering. 
  // For better UX, we could just return children and let components handle it,
  // but for "Merchant Register" we want to be sure.
  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
