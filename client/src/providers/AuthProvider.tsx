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
        if (response?.data?.user) {
          setAuth(response.data.user);
        } else {
          // Response was ok but user data missing - shouldn't happen with correct API
          throw new Error("Invalid user data");
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        
        // Handle "Failed to fetch" (server down) or "Unauthorized"
        const isNetworkError = error instanceof TypeError && error.message === "Failed to fetch";
        const isAuthError = error instanceof Error && (error.message.includes("401") || error.message.includes("403"));

        if (isAuthError || !isNetworkError) {
          // Clear stale session only if it's an explicit auth error 
          // or if it's not a temporary network failure
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          clearAuth();
        }
      } finally {
        // ALWAYS stop loading
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
