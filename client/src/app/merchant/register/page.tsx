"use client";
// client/src/app/merchant/register/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Loader2, 
  Store, 
  MapPin, 
  ChevronRight, 
  Check, 
  User as UserIcon,
  Truck,
  ShieldCheck,
  PartyPopper,
  Plus,
  UploadCloud
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { registerShop } from "@/services/shop.service";
import { useAuthStore } from "@/store/useAuthStore";

// ===== SUB-COMPONENTS (Tách ra ngoài scope main để tối ưu) =====
// ... existing Stepper and FormField components remain unchanged
// I will not replace them here, just the main component part

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, title: "Thông tin Shop", icon: Store },
    { id: 2, title: "Cài đặt vận chuyển", icon: Truck },
    { id: 3, title: "Thông tin định danh", icon: ShieldCheck },
    { id: 4, title: "Hoàn tất", icon: PartyPopper },
  ];

  return (
    <div className="border-b border-gray-100 bg-white px-8 py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300
                  ${currentStep >= step.id 
                    ? "bg-primary-400 text-neutral-900 ring-4 ring-primary-100" 
                    : "bg-gray-100 text-gray-400"}`}
              >
                {currentStep > step.id ? <Check size={20} strokeWidth={3} /> : <step.icon size={20} />}
              </div>
              <span 
                className={`text-xs font-bold transition-colors duration-300
                  ${currentStep >= step.id ? "text-neutral-900" : "text-gray-400"}`}
              >
                {step.title}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="mx-4 h-[2px] flex-1 bg-gray-100">
                <div 
                  className="h-full bg-primary-400 transition-all duration-500" 
                  style={{ width: currentStep > step.id ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FormField = ({ 
  label, 
  required, 
  children, 
  error,
  count,
  max
}: { 
  label: string; 
  required?: boolean; 
  children: React.ReactNode; 
  error?: string;
  count?: number;
  max?: number;
}) => (
  <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:gap-8">
    <div className="flex items-center pt-2 md:justify-end">
      <label className="text-sm font-medium text-gray-600 text-right">
        {required && <span className="mr-1 text-red-500">*</span>}
        {label}
      </label>
    </div>
    <div className="relative md:col-span-3">
      {children}
      {max !== undefined && count !== undefined && (
        <span className="absolute right-3 top-3 text-[10px] text-gray-400">
          {count}/{max}
        </span>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  </div>
);

// ===== MAIN COMPONENT =====

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
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
  const [showAddressForm, setShowAddressForm] = useState(false);

  // KYC Upload States
  const [idCardFrontFile, setIdCardFrontFile] = useState<File | null>(null);
  const [idCardBackFile, setIdCardBackFile] = useState<File | null>(null);
  const [idCardFrontPreview, setIdCardFrontPreview] = useState("");
  const [idCardBackPreview, setIdCardBackPreview] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated && !localStorage.getItem("accessToken")) {
      router.push("/login?redirect=/merchant/register");
    }
  }, [isMounted, isAuthenticated, router]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (idCardFrontPreview) URL.revokeObjectURL(idCardFrontPreview);
      if (idCardBackPreview) URL.revokeObjectURL(idCardBackPreview);
    };
  }, [idCardFrontPreview, idCardBackPreview]);

  if (!isMounted) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-primary-400" size={48} />
        <p className="text-sm font-medium text-gray-500">Đang tải trang đăng ký...</p>
      </div>
    );
  }

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!form.shopName?.trim()) errs.shopName = "Vui lòng nhập tên shop";
    if (form.shopName?.length > 30) errs.shopName = "Tên shop tối đa 30 ký tự";
    
    if (!form.province) errs.province = "Vui lòng hoàn tất địa chỉ lấy hàng";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validate()) {
        setCurrentStep(2);
        window.scrollTo(0, 0);
      } else {
        toast.error("Vui lòng hoàn tất thông tin shop");
      }
    } else if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file vượt quá 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'front') {
      setIdCardFrontFile(file);
      setIdCardFrontPreview(previewUrl);
    } else {
      setIdCardBackFile(file);
      setIdCardBackPreview(previewUrl);
    }
  };

  const handleSubmit = async () => {
    // 1. Re-validate all fields before sending
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin shop (Bước 1)");
      setCurrentStep(1);
      return;
    }

    if (!idCardFrontFile || !idCardBackFile) {
      toast.error("Vui lòng tải lên cả 2 mặt CMND/CCCD");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("shopName", form.shopName);
      formData.append("phone", form.phone || user?.phone || "");
      formData.append("description", form.description);
      
      const addressObject = {
        province: form.province,
        district: form.district,
        ward: form.ward,
        street: form.street,
      };
      formData.append("address", JSON.stringify(addressObject));
      
      formData.append("idCardFront", idCardFrontFile);
      formData.append("idCardBack", idCardBackFile);

      const res = await registerShop(formData);

      if (res.success) {
        toast.success("Gửi hồ sơ thành công!");
        setCurrentStep(4);
      } else {
        throw new Error(res.message || "Đăng ký thất bại");
      }
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

  const isAddressFilled = !!(form.province && form.district && form.ward && form.street);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Toaster position="top-center" />
      
      {/* Header (Shopee Style) */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-400 text-neutral-900">
                <span className="text-lg font-black">N</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">Nyan Market</span>
            </Link>
            <div className="h-6 w-px bg-gray-200"></div>
            <span className="text-lg font-medium text-gray-600">Đăng ký người bán</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <UserIcon size={16} />
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.fullName || "Người dùng"}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto mt-8 max-w-[1000px] px-4 animate-in fade-in duration-500">
        <div className="overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-gray-100">
          
          <Stepper currentStep={currentStep} />

          <div className="min-h-[500px] p-8 md:p-12">
            
            {currentStep === 1 && (
              <div className="space-y-10">
                <h3 className="text-xl font-bold text-neutral-900">Thông tin Shop</h3>
                
                <div className="space-y-8">
                  <FormField 
                    label="Tên Shop" 
                    required 
                    error={errors.shopName}
                    count={form.shopName?.length || 0}
                    max={30}
                  >
                    <input
                      type="text"
                      value={form.shopName}
                      onChange={(e) => updateField("shopName", e.target.value)}
                      placeholder="Nhập tên shop của bạn"
                      className={`w-full rounded-sm border px-4 py-2 text-sm outline-none transition-all
                        ${errors.shopName ? "border-red-500 focus:ring-1 focus:ring-red-100" : "border-gray-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-100"}`}
                    />
                  </FormField>

                  <FormField label="Địa chỉ lấy hàng" required error={errors.province}>
                    <div className="rounded-sm border border-gray-100 bg-gray-50 p-4">
                      {isAddressFilled ? (
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <MapPin className="mt-0.5 text-primary-500" size={18} />
                            <div>
                              <p className="text-sm font-bold text-neutral-900">{form.street}</p>
                              <p className="text-xs text-gray-500">
                                {form.ward}, {form.district}, {form.province}
                              </p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setShowAddressForm(true)}
                            className="text-xs font-medium text-primary-600 hover:underline"
                          >
                            Thay đổi
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => setShowAddressForm(true)}
                          className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          <Plus size={18} />
                          Thêm địa chỉ mới
                        </button>
                      )}
                    </div>

                    {showAddressForm && (
                      <div className="mt-4 grid grid-cols-2 gap-4 rounded-sm border border-gray-200 p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                        <input
                          placeholder="Tỉnh/Thành phố"
                          value={form.province}
                          onChange={(e) => updateField("province", e.target.value)}
                          className="rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                        />
                        <input
                          placeholder="Quận/Huyện"
                          value={form.district}
                          onChange={(e) => updateField("district", e.target.value)}
                          className="rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                        />
                        <input
                          placeholder="Phường/Xã"
                          value={form.ward}
                          onChange={(e) => updateField("ward", e.target.value)}
                          className="rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                        />
                        <input
                          placeholder="Số nhà, tên đường"
                          value={form.street}
                          onChange={(e) => updateField("street", e.target.value)}
                          className="rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="col-span-2 rounded-sm bg-gray-800 py-2 text-xs font-bold text-white hover:bg-gray-700"
                        >
                          Xác nhận địa chỉ
                        </button>
                      </div>
                    )}
                  </FormField>

                  <FormField label="Email">
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        disabled
                        value={user?.email || "Chưa có"}
                        className="flex-1 rounded-sm border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-400"
                      />
                      <button type="button" className="text-xs font-medium text-primary-600 hover:underline">Chỉnh sửa</button>
                    </div>
                  </FormField>

                  <FormField label="Số điện thoại">
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        disabled
                        value={user?.phone || "Chưa cập nhật"}
                        className="flex-1 rounded-sm border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-400"
                      />
                      <button type="button" className="text-xs font-medium text-primary-600 hover:underline">Chỉnh sửa</button>
                    </div>
                  </FormField>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex h-full flex-col items-center justify-center space-y-4 py-20">
                <Truck size={60} className="text-primary-400" />
                <h3 className="text-xl font-bold">Cài đặt vận chuyển</h3>
                <p className="text-center text-gray-500 text-sm">Hệ thống mặc định chọn các đơn vị vận chuyển tiêu chuẩn.<br/>Bạn có thể điều chỉnh sau khi Shop được kích hoạt.</p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex h-full flex-col items-center justify-center space-y-4 py-20">
                <ShieldCheck size={60} className="text-primary-400" />
                <h3 className="text-xl font-bold">Thông tin định danh</h3>
                <p className="max-w-md text-center text-gray-500 text-sm mb-6">
                  Vui lòng tải lên ảnh chụp mặt trước và mặt sau CMND/CCCD của bạn để xác minh danh tính.
                </p>
                
                <div className="grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Front ID Card */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Ảnh mặt trước <span className="text-red-500">*</span></label>
                    <label className="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                      {idCardFrontPreview ? (
                        <img src={idCardFrontPreview} alt="Mặt trước" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <UploadCloud className="mb-2 text-gray-400" size={32} />
                          <span className="text-xs font-medium text-gray-500">Tải ảnh lên (Tối đa 5MB)</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 'front')}
                      />
                    </label>
                  </div>

                  {/* Back ID Card */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Ảnh mặt sau <span className="text-red-500">*</span></label>
                    <label className="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                      {idCardBackPreview ? (
                        <img src={idCardBackPreview} alt="Mặt sau" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <UploadCloud className="mb-2 text-gray-400" size={32} />
                          <span className="text-xs font-medium text-gray-500">Tải ảnh lên (Tối đa 5MB)</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 'back')}
                      />
                    </label>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="mt-8 flex w-full max-w-2xl items-center justify-center gap-2 rounded-sm bg-primary-400 px-10 py-3 font-bold text-neutral-900 shadow-sm hover:bg-primary-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang xử lý hồ sơ...
                    </>
                  ) : (
                    "Hoàn tất & Gửi hồ sơ"
                  )}
                </button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex h-full flex-col items-center justify-center space-y-4 py-20 animate-in zoom-in duration-500">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900">Đăng ký thành công!</h3>
                <p className="text-center text-gray-500 text-sm">
                  Hồ sơ của bạn đang được hệ thống kiểm duyệt.<br/>
                  Kết quả sẽ được gửi về email trong vòng 24h làm việc.
                </p>
                <Link 
                  href="/"
                  className="mt-6 rounded-sm border border-gray-200 px-8 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Về trang chủ
                </Link>
              </div>
            )}

          </div>

          {currentStep < 4 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-white p-6">
              <button 
                type="button"
                onClick={() => currentStep > 1 && setCurrentStep(prev => prev - 1)}
                className={`text-sm font-medium text-gray-400 hover:text-gray-600 ${currentStep === 1 ? 'invisible' : 'visible'}`}
              >
                Quay lại
              </button>
              <div className="flex gap-3">
                <button type="button" className="rounded-sm border border-gray-200 px-8 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Lưu
                </button>
                <button 
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 rounded-sm bg-primary-400 px-10 py-2 text-sm font-bold text-neutral-900 shadow-sm transition-all hover:bg-primary-500 active:scale-95"
                >
                  Tiếp theo
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
