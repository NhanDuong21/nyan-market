"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setIsInitialized } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    let mounted = true;

    const initAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          if (mounted) setAuth(null, false);
          return;
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setAuth(data.data.user, true);
        } else {
          localStorage.removeItem("accessToken");
          if (mounted) setAuth(null, false);
        }
      } catch (error) {
        if (mounted) setAuth(null, false);
      } finally {
        if (mounted) {
          setIsInitialized(true);
          hasInitialized.current = true;
        }
      }
    };

    initAuth();

    // FAILSAFE: 3 seconds to unblock UI if API is slow or hung
    const failsafe = setTimeout(() => {
      if (mounted && !hasInitialized.current) {
        setIsInitialized(true);
        hasInitialized.current = true;
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(failsafe);
    };
  }, [setAuth, setIsInitialized]);

  return <>{children}</>;
}
