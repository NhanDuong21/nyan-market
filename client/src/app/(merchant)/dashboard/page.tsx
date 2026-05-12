"use client";

import React from "react";
import Link from "next/link";
import { 
  ClipboardList, 
  Package, 
  AlertCircle, 
  TrendingUp, 
  Plus, 
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const KPICard = ({ label, value, icon: Icon, color }: KPICardProps) => (
  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="mt-2 text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default function MerchantDashboardPage() {
  const { user } = useAuthStore();

  const kpis = [
    { label: "Đơn hàng chờ duyệt", value: 0, icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
    { label: "Đang giao", value: 0, icon: ShoppingBag, color: "bg-orange-50 text-orange-600" },
    { label: "Sản phẩm hết hàng", value: 0, icon: AlertCircle, color: "bg-red-50 text-red-600" },
    { label: "Doanh thu tạm tính", value: "0₫", icon: TrendingUp, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chào mừng quay trở lại, {user?.fullName || "Chủ Shop"}!
          </h1>
          <p className="mt-1 text-gray-500">
            Chào mừng bạn đến với Nyan Market Seller Centre. Chúc bạn một ngày buôn may bán đắt!
          </p>
        </div>
        <Link 
          href="/merchant/products/new"
          className="flex items-center gap-2 rounded-lg bg-primary-400 px-6 py-3 text-sm font-bold text-neutral-900 shadow-lg shadow-primary-100 transition-all hover:bg-primary-500 active:scale-95"
        >
          <Plus size={18} />
          Thêm sản phẩm mới
        </Link>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Quick Actions & Tips */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Việc cần làm</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-50 bg-gray-50/50 p-4 text-center">
                <div className="text-xl font-bold text-primary-600">0</div>
                <div className="text-xs text-gray-500 mt-1">Đơn hàng mới</div>
              </div>
              <div className="rounded-lg border border-gray-50 bg-gray-50/50 p-4 text-center">
                <div className="text-xl font-bold text-primary-600">0</div>
                <div className="text-xs text-gray-500 mt-1">Sản phẩm bị khóa</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Phân tích bán hàng</h2>
            <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/50">
              <TrendingUp size={32} className="text-gray-300" />
              <p className="text-sm text-gray-400">Chưa có dữ liệu phân tích cho giai đoạn này</p>
            </div>
          </div>
        </div>

        {/* Sidebar News/Updates */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Thông báo</h2>
              <Link href="#" className="text-xs font-medium text-primary-600 hover:underline">Xem tất cả</Link>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 group cursor-pointer">
                  <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary-400"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      Chào mừng bạn gia nhập Nyan Market!
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">12/05/2026</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-gradient-to-br from-primary-400 to-yellow-500 p-6 text-neutral-900 shadow-lg shadow-primary-100">
            <h3 className="font-black">Học viện Người bán</h3>
            <p className="mt-2 text-xs font-medium opacity-90 leading-relaxed">
              Khám phá các mẹo kinh doanh hiệu quả để bùng nổ doanh số cùng Nyan Market.
            </p>
            <button className="mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95">
              Khám phá ngay
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
