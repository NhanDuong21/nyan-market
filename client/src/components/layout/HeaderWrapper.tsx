"use client";
// client/src/components/layout/HeaderWrapper.tsx

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();
  
  // Ẩn Header ở các trang auth (login, register)
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");

  if (isAuthPage) {
    return null;
  }

  return <Header />;
}
