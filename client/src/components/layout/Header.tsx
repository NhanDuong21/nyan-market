"use client";
// client/src/components/layout/Header.tsx

import Link from "next/link";
import { Search, ShoppingCart, User as UserIcon, LogOut, Store } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Hydration mismatch fix
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    // Reset Zustand store + LocalStorage (handled inside logout)
    logout();
    
    // Redirect
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-primary-400 shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-primary-500 py-1">
        <div className="mx-auto flex max-w-7xl justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <Link 
              href={isAuthenticated && user?.roles?.includes("merchant") ? "/merchant/dashboard" : "/merchant/register"} 
              className="flex items-center gap-1 text-[12px] font-medium text-neutral-900 transition-colors hover:text-white"
            >
              <Store size={12} />
              Kênh Người Bán
            </Link>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-[12px] font-medium text-neutral-900 hover:text-white">Trợ giúp</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <span className="text-xl font-black text-primary-500">N</span>
            </div>
            <span className="hidden text-2xl font-bold text-neutral-900 lg:block">
              Nyan Market
            </span>
          </Link>
        </div>

        {/* Middle: Search Bar */}
        <div className="mx-8 flex-1 max-w-2xl">
          <div className="relative flex w-full items-center">
            <input
              type="text"
              placeholder="Nyan Market - Mua gì cũng có!"
              className="w-full rounded-xl border-none bg-white py-2.5 pl-5 pr-12 text-sm text-neutral-800 shadow-sm outline-none focus:ring-2 focus:ring-white"
            />
            <button className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-400 text-neutral-900 transition-colors hover:bg-white">
              <Search size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Right: Cart & Account */}
        <div className="flex items-center gap-5">
          
          {/* Cart Icon */}
          <Link href="/cart" className="relative flex items-center text-neutral-900 hover:text-white transition-colors">
            <ShoppingCart size={26} strokeWidth={2} />
            <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary-600 shadow-sm ring-2 ring-primary-400">
              0
            </span>
          </Link>

          {/* Account Section - Only render when mounted to avoid hydration error */}
          {isMounted && (
            isAuthenticated && user ? (
              <div className="group relative flex cursor-pointer items-center gap-2 py-1">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white/50 bg-white shadow-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon size={20} className="text-neutral-500" />
                  )}
                </div>
                <span className="hidden max-w-[100px] truncate text-sm font-bold text-neutral-900 sm:block">
                  {user.fullName}
                </span>

                {/* Dropdown Menu (Hover) */}
                <div className="absolute right-0 top-full hidden w-56 pt-2 group-hover:block animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-2xl">
                    <div className="border-b border-neutral-100 px-4 py-3 bg-neutral-50/50">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-neutral-900">{user.fullName}</p>
                        {user.roles?.includes("merchant") && (
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">
                            Merchant
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-neutral-500">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/user/profile" className="block px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
                        Tài khoản của tôi
                      </Link>
                      <Link href="/user/orders" className="block px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50">
                        Đơn mua
                      </Link>
                      <div className="my-1 h-px bg-neutral-100"></div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/register"
                  className="hidden text-sm font-bold text-neutral-900 hover:text-white sm:block"
                >
                  Đăng ký
                </Link>
                <span className="hidden h-4 w-px bg-neutral-900/20 sm:block"></span>
                <Link
                  href="/login"
                  className="rounded-lg bg-white px-5 py-2 text-sm font-bold text-primary-600 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Đăng nhập
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
