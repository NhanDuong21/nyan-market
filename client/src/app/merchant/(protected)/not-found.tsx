// client/src/app/merchant/not-found.tsx
import Link from "next/link";
import { LayoutDashboard, AlertCircle } from "lucide-react";

/**
 * Scoped Merchant 404 Page.
 * This prevents the Merchant Sidebar from hanging when navigating to 
 * non-existent admin routes (e.g., /merchant/settings).
 */
export default function MerchantNotFound() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertCircle size={32} />
      </div>

      <h1 className="text-xl font-bold text-gray-900">
        Trang quản trị không tồn tại
      </h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Đường dẫn bạn truy cập không thuộc phạm vi quản lý của Kênh người bán hoặc đang được cập nhật.
      </p>

      <div className="mt-8">
        <Link
          href="/merchant/dashboard"
          className="flex items-center gap-2 rounded-lg bg-primary-400 px-6 py-2.5 text-sm font-bold text-neutral-900 shadow-sm transition-all hover:bg-primary-500 active:scale-95"
        >
          <LayoutDashboard size={18} />
          Quay về trang tổng quan
        </Link>
      </div>
    </div>
  );
}
