"use client";
// client/src/app/(merchant)/register/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Store, Phone, MapPin, AlignLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { registerShop } from "@/services/shop.service";
import { useAuthStore } from "@/store/useAuthStore";

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [form, setForm] = useState({
    shopName: "",
    phone: "",
    description: "",
    province: "",
    district: "",
    ward: "",
    street: "",
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated (can also be handled by an HOC later)
  if (typeof window !== "undefined" && !isAuthenticated && !localStorage.getItem("accessToken")) {
    router.push("/login?redirect=/merchant/register");
    return null;
  }

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!form.shopName.trim()) errs.shopName = "Vui lòng nhập tên quán";
    if (!form.phone.trim()) {
      errs.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0|\+84)[0-9]{9}$/.test(form.phone)) {
      errs.phone = "Số điện thoại không hợp lệ";
    }
    if (!form.province.trim()) errs.province = "Vui lòng nhập tỉnh/thành phố";
    if (!form.district.trim()) errs.district = "Vui lòng nhập quận/huyện";
    if (!form.ward.trim()) errs.ward = "Vui lòng nhập phường/xã";
    if (!form.street.trim()) errs.street = "Vui lòng nhập tên đường/số nhà";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    setIsLoading(true);
    try {
      await registerShop({
        shopName: form.shopName,
        phone: form.phone,
        description: form.description,
        address: {
          province: form.province,
          district: form.district,
          ward: form.ward,
          street: form.street,
        },
      });

      toast.success("Đăng ký thành công, vui lòng chờ Admin kiểm duyệt");
      setTimeout(() => router.push("/merchant/pending"), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header/Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-400 shadow-sm">
              <span className="text-2xl font-black text-neutral-900">N</span>
            </div>
            <span className="text-2xl font-bold text-neutral-900">Nyan Market</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-neutral-200/50">
          
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-primary-400 to-primary-500 px-8 py-10 text-center">
            <h2 className="text-3xl font-bold text-neutral-900">Trở thành Người bán</h2>
            <p className="mt-2 text-neutral-800">
              Đăng ký mở quán trên Nyan Market để tiếp cận hàng triệu khách hàng
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-10">
            <div className="space-y-6">
              
              {/* Shop Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Tên quán <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    value={form.shopName}
                    onChange={(e) => updateField("shopName", e.target.value)}
                    placeholder="Ví dụ: Nyan Fashion"
                    className={`w-full rounded-xl border bg-neutral-50 py-3 pl-10 pr-4 text-neutral-800 outline-none transition-all focus:bg-white focus:ring-2
                      ${errors.shopName ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"}`}
                  />
                </div>
                {errors.shopName && <p className="mt-1 text-sm text-red-500">{errors.shopName}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Số điện thoại quán <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="0912345678"
                    className={`w-full rounded-xl border bg-neutral-50 py-3 pl-10 pr-4 text-neutral-800 outline-none transition-all focus:bg-white focus:ring-2
                      ${errors.phone ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"}`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>

              {/* Address - Grid */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Địa chỉ quán <span className="text-red-500">*</span>
                </label>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Province */}
                  <div>
                    <input
                      type="text"
                      value={form.province}
                      onChange={(e) => updateField("province", e.target.value)}
                      placeholder="Tỉnh / Thành phố"
                      className={`w-full rounded-xl border bg-neutral-50 px-4 py-3 text-neutral-800 outline-none transition-all focus:bg-white focus:ring-2
                        ${errors.province ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"}`}
                    />
                    {errors.province && <p className="mt-1 text-sm text-red-500">{errors.province}</p>}
                  </div>
                  
                  {/* District */}
                  <div>
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) => updateField("district", e.target.value)}
                      placeholder="Quận / Huyện"
                      className={`w-full rounded-xl border bg-neutral-50 px-4 py-3 text-neutral-800 outline-none transition-all focus:bg-white focus:ring-2
                        ${errors.district ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"}`}
                    />
                    {errors.district && <p className="mt-1 text-sm text-red-500">{errors.district}</p>}
                  </div>

                  {/* Ward */}
                  <div>
                    <input
                      type="text"
                      value={form.ward}
                      onChange={(e) => updateField("ward", e.target.value)}
                      placeholder="Phường / Xã"
                      className={`w-full rounded-xl border bg-neutral-50 px-4 py-3 text-neutral-800 outline-none transition-all focus:bg-white focus:ring-2
                        ${errors.ward ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"}`}
                    />
                    {errors.ward && <p className="mt-1 text-sm text-red-500">{errors.ward}</p>}
                  </div>

                  {/* Street */}
                  <div>
                    <input
                      type="text"
                      value={form.street}
                      onChange={(e) => updateField("street", e.target.value)}
                      placeholder="Số nhà, tên đường"
                      className={`w-full rounded-xl border bg-neutral-50 px-4 py-3 text-neutral-800 outline-none transition-all focus:bg-white focus:ring-2
                        ${errors.street ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"}`}
                    />
                    {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street}</p>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Mô tả quán (Tùy chọn)
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 text-neutral-400" size={18} />
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Giới thiệu sơ lược về các sản phẩm bạn bán..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-neutral-800 outline-none transition-all placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

            </div>

            {/* Submit */}
            <div className="mt-10">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-400 py-4 text-lg font-bold text-neutral-900 shadow-md transition-all hover:bg-primary-500 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang gửi đăng ký...
                  </>
                ) : (
                  "Đăng Ký Mở Quán"
                )}
              </button>
              
              <p className="mt-4 text-center text-sm text-neutral-500">
                Bằng việc đăng ký, bạn đồng ý với <a href="#" className="font-medium text-primary-600 underline">Quy chế người bán</a> của Nyan Market.
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
