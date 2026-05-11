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
        // Token might be expired or invalid, clear it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [setAuth, clearAuth]);

  // Optional: You could return a loading spinner here if you want to block rendering
  // until auth state is known, but usually it's better to render children and let
  // components decide what to show based on `isAuthenticated` state.
  return <>{children}</>;
}
