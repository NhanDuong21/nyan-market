"use client";

import React from "react";
import Link from "next/link";
import { Plus, Package, Search } from "lucide-react";

export default function MerchantProductsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <Link 
          href="/merchant/products/new"
          className="flex items-center gap-2 rounded-lg bg-primary-400 px-6 py-2.5 text-sm font-bold text-neutral-900 shadow-sm transition-all hover:bg-primary-500"
        >
          <Plus size={18} />
          Thêm sản phẩm mới
        </Link>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
          <Package size={32} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-gray-900">Bạn chưa đăng sản phẩm nào</h3>
        <p className="mt-1 text-sm text-gray-500">Hãy bắt đầu kinh doanh bằng cách đăng sản phẩm đầu tiên của bạn.</p>
        <Link 
          href="/merchant/products/new"
          className="mt-6 inline-block rounded-lg border border-primary-400 px-8 py-2 text-sm font-bold text-primary-600 transition-all hover:bg-primary-50"
        >
          Đăng sản phẩm ngay
        </Link>
      </div>
    </div>
  );
}
