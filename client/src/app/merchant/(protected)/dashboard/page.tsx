"use client";

import React from "react";
import Link from "next/link";
import { Plus, LayoutDashboard, ShoppingBag, Package, Star, TrendingUp } from "lucide-react";

export default function MerchantDashboardPage() {
  const stats = [
    { label: "Doanh thu", value: "0₫", icon: TrendingUp, color: "text-blue-600" },
    { label: "Đơn hàng", value: "0", icon: ShoppingBag, color: "text-orange-600" },
    { label: "Sản phẩm", value: "0", icon: Package, color: "text-green-600" },
    { label: "Đánh giá", value: "0", icon: Star, color: "text-yellow-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan Shop</h1>
        <Link 
          href="/merchant/products/new"
          className="flex items-center gap-2 rounded-lg bg-primary-400 px-6 py-2.5 text-sm font-bold text-neutral-900 shadow-sm transition-all hover:bg-primary-500"
        >
          <Plus size={18} />
          Thêm sản phẩm mới
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-lg bg-gray-50 p-3 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
          <LayoutDashboard size={32} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-gray-900">Chưa có dữ liệu thống kê</h3>
        <p className="mt-1 text-sm text-gray-500">Hãy bắt đầu đăng bán sản phẩm để xem hiệu quả kinh doanh của bạn.</p>
      </div>
    </div>
  );
}
