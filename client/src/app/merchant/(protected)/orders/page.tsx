"use client";

import React from "react";
import { ClipboardList, Search } from "lucide-react";

export default function MerchantOrdersPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
      </div>

      {/* Filter Tabs Mock */}
      <div className="flex gap-8 border-b border-gray-100 bg-white px-6 py-4 shadow-sm rounded-t-xl">
        {["Tất cả", "Chờ xác nhận", "Chờ lấy hàng", "Đang giao", "Đã giao", "Đơn hủy"].map((tab, idx) => (
          <button 
            key={idx} 
            className={`pb-2 text-sm font-bold transition-all ${idx === 0 ? "border-b-2 border-primary-400 text-primary-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-b-xl border border-t-0 border-gray-100 bg-white p-20 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
          <ClipboardList size={32} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-gray-900">Chưa có đơn hàng nào</h3>
        <p className="mt-1 text-sm text-gray-500">Khi khách hàng đặt mua sản phẩm, đơn hàng sẽ xuất hiện tại đây.</p>
      </div>
    </div>
  );
}
