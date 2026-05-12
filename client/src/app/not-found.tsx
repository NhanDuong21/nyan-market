"use client";
// client/src/app/not-found.tsx
import Link from "next/link";
import { Home, ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-white px-4 text-center">
      {/* Visual Element */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 animate-pulse rounded-full bg-primary-100 opacity-50 blur-2xl"></div>
        <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-primary-400 text-neutral-900 shadow-xl">
          <Ghost size={64} strokeWidth={2.5} />
        </div>
        <div className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white font-black text-primary-500 shadow-lg ring-4 ring-primary-50">
          404
        </div>
      </div>

      {/* Text Content */}
      <h1 className="text-3xl font-black text-neutral-900 md:text-4xl">
        Ối! Trang này biến mất rồi
      </h1>
      <p className="mt-4 max-w-md text-lg font-medium text-gray-500">
        Có vẻ như đường dẫn này không tồn tại hoặc đã bị di dời. Đừng lo, Nyan Market vẫn còn rất nhiều thứ hay ho khác!
      </p>

      {/* Actions */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-primary-400 px-8 py-4 text-sm font-black text-neutral-900 shadow-lg shadow-primary-200 transition-all hover:scale-105 active:scale-95"
        >
          <Home size={18} />
          Quay về trang chủ
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-xl border-2 border-gray-100 bg-white px-8 py-4 text-sm font-black text-gray-500 transition-all hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Quay lại trang trước
        </button>
      </div>

      {/* Decorative Circles */}
      <div className="absolute left-10 top-20 h-4 w-4 rounded-full bg-primary-200"></div>
      <div className="absolute right-20 top-40 h-6 w-6 rounded-full bg-primary-300 opacity-30"></div>
      <div className="absolute bottom-20 left-1/4 h-8 w-8 rounded-full bg-primary-100"></div>
    </div>
  );
}
