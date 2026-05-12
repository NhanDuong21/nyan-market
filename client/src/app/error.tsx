"use client";
// client/src/app/error.tsx

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[GLOBAL ERROR BOUNDARY]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-4 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-50 text-red-500 ring-8 ring-red-50/50">
        <AlertTriangle size={48} />
      </div>

      <h1 className="text-2xl font-black text-gray-900 md:text-3xl">
        Đã có lỗi xảy ra!
      </h1>
      
      <div className="mt-4 max-w-md rounded-xl bg-gray-50 p-4 text-left">
        <p className="text-xs font-mono text-gray-500 break-all">
          {error.message || "Unknown Runtime Error"}
        </p>
        {error.digest && (
          <p className="mt-1 text-[10px] font-mono text-gray-400">
            Digest: {error.digest}
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-xl bg-primary-400 px-8 py-4 text-sm font-black text-neutral-900 shadow-lg shadow-primary-200 transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCcw size={18} />
          Thử lại
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border-2 border-gray-100 bg-white px-8 py-4 text-sm font-black text-gray-500 transition-all hover:bg-gray-50"
        >
          <Home size={18} />
          Về trang chủ
        </Link>
      </div>
      
      <p className="mt-8 text-xs text-gray-400">
        Nếu lỗi này vẫn tiếp diễn, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật.
      </p>
    </div>
  );
}
