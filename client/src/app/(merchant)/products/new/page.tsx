"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { 
  Plus, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  ChevronLeft, 
  Tag, 
  Info,
  DollarSign,
  Package as PackageIcon
} from "lucide-react";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form State
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    category: "",
  });

  // Image Upload State
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error("Fetch categories error:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 9) {
      toast.error("Chỉ được tải lên tối đa 9 ảnh");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 ảnh sản phẩm");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("originalPrice", form.originalPrice);
      formData.append("stock", form.stock);
      formData.append("category", form.category);

      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Đăng sản phẩm thành công!");
        router.push("/merchant/products");
      } else {
        throw new Error(data.message || "Đăng sản phẩm thất bại");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/merchant/products"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all hover:text-gray-900"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
            <Info size={18} className="text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900">Thông tin cơ bản</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tên sản phẩm *</label>
              <input 
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="Ví dụ: Áo thun nam Cotton co giãn 4 chiều"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Danh mục *</label>
                <div className="relative">
                  <select 
                    required
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <Tag className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Mô tả sản phẩm *</label>
              <textarea 
                required
                rows={6}
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Nhập chi tiết về sản phẩm của bạn..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
            <DollarSign size={18} className="text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900">Giá bán & Kho hàng</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Giá bán *</label>
              <div className="relative">
                <input 
                  required
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({...form, price: e.target.value})}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
                />
                <span className="absolute left-4 top-3.5 text-xs font-bold text-gray-400">₫</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Giá gốc (nếu có)</label>
              <div className="relative">
                <input 
                  type="number"
                  value={form.originalPrice}
                  onChange={(e) => setForm({...form, originalPrice: e.target.value})}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
                />
                <span className="absolute left-4 top-3.5 text-xs font-bold text-gray-400">₫</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Kho hàng *</label>
              <div className="relative">
                <input 
                  required
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({...form, stock: e.target.value})}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
                />
                <PackageIcon className="absolute left-4 top-3.5 text-gray-400" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
            <ImageIcon size={18} className="text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900">Hình ảnh sản phẩm</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {previews.map((src, index) => (
              <div key={index} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                <img src={src} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {previews.length < 9 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-primary-400 hover:bg-primary-50/50">
                <Plus className="text-gray-400" size={24} />
                <span className="mt-1 text-[10px] font-bold text-gray-500">Thêm ảnh ({previews.length}/9)</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-8">
          <Link 
            href="/merchant/products"
            className="rounded-lg px-8 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
          >
            Hủy bỏ
          </Link>
          <button 
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-primary-400 px-10 py-3 text-sm font-bold text-neutral-900 shadow-lg shadow-primary-200 transition-all hover:bg-primary-500 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang đăng bài...
              </>
            ) : (
              "Lưu & Hiển thị"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
