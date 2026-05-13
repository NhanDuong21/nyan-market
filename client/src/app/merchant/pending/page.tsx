"use client";

import React from "react";
import Link from "next/link";
import { Hourglass } from "lucide-react";

export default function MerchantPendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
        <div className="flex flex-col items-center p-10 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-primary-500 shadow-sm ring-8 ring-primary-50">
            <Hourglass size={48} className="animate-pulse" strokeWidth={1.5} />
          </div>
          
          <h1 className="mb-3 text-2xl font-black text-neutral-900">
            Hồ sơ đang được duyệt
          </h1>
          
          <p className="mb-8 text-sm font-medium leading-relaxed text-gray-500">
            Vui lòng chờ Admin kiểm duyệt trong vòng 24h. Kết quả sẽ được gửi qua email của bạn.
          </p>

          <Link 
            href="/"
            className="flex w-full items-center justify-center rounded-xl bg-primary-400 px-6 py-3.5 text-sm font-bold text-neutral-900 shadow-sm transition-all hover:bg-primary-500 hover:shadow-md active:scale-[0.98]"
          >
            Quay về Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
