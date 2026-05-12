// client/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nyan Market — Sàn TMĐT đa người bán",
  description:
    "Nyan Market - Nền tảng thương mại điện tử đa người bán. Mua sắm hàng triệu sản phẩm với giá tốt nhất.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {/* AuthProvider must be at the highest level to ensure it mounts immediately */}
        <AuthProvider>
          <HeaderWrapper />
          {/* Suspense only wraps the dynamic children, not the shell */}
          <Suspense fallback={
            <div className="flex flex-1 items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Đang tải nội dung...</span>
              </div>
            </div>
          }>
            {children}
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
