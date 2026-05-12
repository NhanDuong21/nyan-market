// client/src/app/not-found.tsx
import Link from "next/link";
import { Home } from "lucide-react";

/**
 * Standard Server-Side 404 Page.
 * Removing "use client" as Next.js 14 handles navigation back from 
 * server-side not-found pages more reliably in the layout tree.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-white px-4 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-400 text-neutral-900 shadow-xl">
        <span className="text-4xl font-black">404</span>
      </div>

      <h1 className="text-2xl font-black text-neutral-900">
        Không tìm thấy trang
      </h1>
      <p className="mt-4 max-w-sm text-sm text-gray-500">
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa.
      </p>

      <div className="mt-10">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-primary-400 px-8 py-4 text-sm font-black text-neutral-900 shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Home size={18} />
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
