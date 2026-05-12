"use client";
// client/src/components/layout/HeaderWrapper.tsx

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();
  
  // Ẩn Header ở các trang auth (login, register) và trang merchant
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");
  const isMerchantPage = pathname?.startsWith("/merchant");

  if (isAuthPage || isMerchantPage) {
    return null;
  }

  return <Header />;
}
