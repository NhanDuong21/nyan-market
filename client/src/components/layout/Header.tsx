"use client";
// client/src/components/layout/Header.tsx

import Link from "next/link";
import { Search, ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = () => {
    // Xóa khỏi localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    
    // Reset Zustand store
    clearAuth();
    
    // Redirect (tùy chọn)
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-primary-400 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <span className="text-xl font-black text-primary-500">N</span>
            </div>
            <span className="hidden text-2xl font-bold text-neutral-900 sm:block">
              Nyan Market
            </span>
          </Link>
        </div>

        {/* Middle: Search Bar */}
        <div className="mx-8 hidden flex-1 max-w-2xl md:block">
          <div className="relative flex w-full items-center">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, danh mục..."
              className="w-full rounded-full border-none bg-white py-2.5 pl-5 pr-12 text-sm text-neutral-800 shadow-inner outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-neutral-900 transition-colors hover:bg-primary-600">
              <Search size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Right: Cart & Account */}
        <div className="flex items-center gap-6">
          
          {/* Cart Icon */}
          <Link href="/cart" className="relative flex items-center text-neutral-900 hover:text-neutral-700">
            <ShoppingCart size={24} strokeWidth={2} />
            {/* Badge tạm thời */}
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary-600 shadow-sm">
              0
            </span>
          </Link>

          {/* Account Section */}
          {isAuthenticated && user ? (
            <div className="group relative flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white border border-white/20">
                {user.avatar ? (
                  // Tạm thời dùng img, sẽ đổi sang Next Image khi có domain
                  <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={20} className="text-neutral-500" />
                )}
              </div>
              <span className="hidden max-w-[120px] truncate text-sm font-semibold text-neutral-900 sm:block">
                {user.fullName}
              </span>

              {/* Dropdown Menu (Hover) */}
              <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-xl border border-neutral-100 bg-white py-2 shadow-xl group-hover:block">
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="truncate text-sm font-medium text-neutral-900">{user.fullName}</p>
                  <p className="truncate text-xs text-neutral-500">{user.email}</p>
                </div>
                <Link href="/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                  Tài khoản của tôi
                </Link>
                <Link href="/orders" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                  Đơn mua
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="hidden text-sm font-medium text-neutral-800 hover:text-neutral-600 sm:block"
              >
                Đăng ký
              </Link>
              <span className="hidden h-4 w-px bg-neutral-900/20 sm:block"></span>
              <Link
                href="/login"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-600 shadow-sm transition-transform hover:scale-105"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
