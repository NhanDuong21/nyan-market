"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Settings, 
  Store, 
  ChevronRight,
  LogOut,
  Bell,
  Search,
  User
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, isActive }: SidebarItemProps) => (
  <Link 
    href={href}
    className={`flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 group
      ${isActive 
        ? "bg-primary-50 text-neutral-900 shadow-sm ring-1 ring-primary-100" 
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={isActive ? "text-primary-500" : "text-gray-400 group-hover:text-gray-600"} />
      <span className="text-sm font-semibold">{label}</span>
    </div>
    {isActive && <ChevronRight size={14} className="text-primary-400" />}
  </Link>
);

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Handle redirects ONLY here. DO NOT manage loading state here.
    if (!isInitialized) return;

    if (!user) {
      router.replace("/login?redirect=/merchant/dashboard");
    } else if (!user.roles?.includes("merchant")) {
      router.replace("/merchant/register");
    }
  }, [isInitialized, user, router]);

  // 1. Global Auth is still loading (First paint or race condition)
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-primary-100 border-t-primary-500"></div>
          <h2 className="mt-6 text-lg font-bold text-neutral-900">Nyan Market</h2>
          <p className="mt-2 text-sm font-medium text-gray-500">Đang chuẩn bị không gian làm việc...</p>
        </div>
      </div>
    );
  }

  // 2. Initialized, but unauthorized. 
  // (The useEffect is about to redirect them. We return the loading screen here to prevent a UI flash of the dashboard).
  if (!user || !user.roles?.includes("merchant")) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-primary-100 border-t-primary-500"></div>
          <p className="mt-6 text-sm font-medium text-gray-500">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  // 3. Fully Authorized. Render IMMEDIATELY. No local state delays.
  // This block is reached instantly during BFCache restoration.
  const menuItems = [
    { href: "/merchant/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { href: "/merchant/products", icon: Package, label: "Sản phẩm" },
    { href: "/merchant/orders", icon: ClipboardList, label: "Đơn hàng" },
    { href: "/merchant/settings", icon: Settings, label: "Cài đặt Shop" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-100 bg-white">
        <div className="flex h-full flex-col">
          {/* Logo Area */}
          <div className="flex h-16 items-center border-b border-gray-50 px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-400 text-neutral-900">
                <span className="text-lg font-black">N</span>
              </div>
              <span className="text-lg font-bold text-neutral-900">Kênh Người Bán</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname.startsWith(item.href)}
              />
            ))}
          </nav>

          {/* Footer Navigation */}
          <div className="border-t border-gray-50 p-4">
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut size={20} />
              Thoát
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="flex h-full items-center justify-between px-8">
            <div className="flex items-center gap-4 text-gray-400">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Tìm kiếm chức năng..." 
                className="bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-6">
              <button className="relative text-gray-400 hover:text-gray-600">
                <Bell size={22} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  3
                </span>
              </button>
              
              <div className="h-6 w-px bg-gray-100"></div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{user?.fullName || "Chủ Shop"}</div>
                  <div className="text-[10px] font-medium text-primary-600">Merchant</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 ring-2 ring-primary-50">
                  <User size={20} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
