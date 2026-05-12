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
    // Safety timeout: stop loading after 10s no matter what
    const timeoutId = setTimeout(() => {
      setIsInitializing(false);
    }, 10000);

    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setIsInitializing(false);
        clearTimeout(timeoutId);
        return;
      }

      try {
        const response = await getMe();
        if (response.data?.user) {
          setAuth(response.data.user);
        }
      } catch (error) {
        console.error("Auto login failed:", error);
        // Don't clear storage on simple network error, only on 401/403
        if (error instanceof Error && (error.message.includes("401") || error.message.includes("403"))) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          clearAuth();
        }
      } finally {
        setIsInitializing(false);
        clearTimeout(timeoutId);
      }
    };

    initAuth();
    
    return () => clearTimeout(timeoutId);
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
