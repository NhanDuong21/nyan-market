"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Package, Edit2, Trash2, ExternalLink, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import type { Product } from "@/types";
import { getMerchantProducts } from "@/services/product.service";

export default function MerchantProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Strict early return if data is already cached
    if (products.length > 0) {
      setIsLoading(false);
      return; 
    }

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getMerchantProducts();
        setProducts(data);
      } catch (error) {
        console.error("Fetch products error:", error);
      } finally {
        // 2. ABSOLUTE GUARANTEE to turn off spinner
        setIsLoading(false);
      }
    };

    fetchProducts();

    // 3. ULTIMATE FAILSAFE: If network hangs, kill spinner after 4 seconds
    const failsafeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(failsafeTimer);
  }, []); // <-- STRICTLY EMPTY DEPENDENCY ARRAY

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500">Bạn đang có {products.length} sản phẩm trong cửa hàng</p>
        </div>
        <Link 
          href="/merchant/products/new"
          className="flex items-center gap-2 rounded-lg bg-primary-400 px-6 py-2.5 text-sm font-bold text-neutral-900 shadow-sm transition-all hover:bg-primary-500"
        >
          <Plus size={18} />
          Thêm sản phẩm mới
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary-400" />
            <p className="text-sm font-medium text-gray-500">Đang tải danh sách sản phẩm...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
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
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Danh mục</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Giá</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Kho</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product._id} className="transition-colors hover:bg-gray-50/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-100">
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="max-w-xs">
                        <p className="line-clamp-1 text-sm font-bold text-gray-900">{product.name}</p>
                        <p className="text-[10px] text-gray-400">ID: {product._id.substring(18)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {product.category?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm font-medium ${product.stock < 5 ? "text-red-500" : "text-gray-600"}`}>
                      {product.stock}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold
                      ${product.status === "active" 
                        ? "bg-green-50 text-green-600" 
                        : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${product.status === "active" ? "bg-green-600" : "bg-gray-400"}`}></span>
                      {product.status === "active" ? "Đang bán" : "Ẩn"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-primary-100 hover:text-primary-600">
                        <Edit2 size={14} />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                      <Link 
                        href={`/merchant/products/${product._id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
