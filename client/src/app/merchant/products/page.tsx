"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Package, Search, Edit2, Trash2, ExternalLink, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  price: number;
  stock: number;
  status: string;
  createdAt: string;
}

export default function MerchantProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/products/my-products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setProducts(data.data.products);
        } else {
          toast.error(data.message || "Không thể lấy danh sách sản phẩm");
        }
      } catch (error) {
        console.error("Fetch products error:", error);
        toast.error("Lỗi kết nối đến server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary-400" />
          <p className="text-sm font-medium text-gray-500">Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-8">
        <Toaster position="top-right" />
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

      {/* Product Table */}
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
                        href={`/products/${product._id}`} // Giả định route xem chi tiết
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
    </div>
  );
}
