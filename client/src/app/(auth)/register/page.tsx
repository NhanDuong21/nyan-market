"use client";
// client/src/app/(auth)/register/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { registerUser, verifyOtp } from "@/services/auth.service";
import OtpModal from "@/components/auth/OtpModal";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpModal, setOtpModal] = useState(false);

  // ===== CLIENT VALIDATION =====
  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.fullName.trim()) errs.fullName = "Vui lòng nhập họ tên";
    if (!form.email.trim()) {
      errs.email = "Vui lòng nhập email";
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      errs.email = "Email không hợp lệ";
    }
    if (!form.password) {
      errs.password = "Vui lòng nhập mật khẩu";
    } else if (form.password.length < 8) {
      errs.password = "Mật khẩu tối thiểu 8 ký tự";
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ===== SUBMIT REGISTER =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsLoading(true);
    try {
      await registerUser({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      setOtpModal(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đăng ký thất bại";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== VERIFY OTP =====
  const handleVerifyOtp = async (otp: string) => {
    await verifyOtp({ email: form.email, otp });
    toast.success("Xác thực thành công! Đang chuyển hướng...");
    setOtpModal(false);
    setTimeout(() => router.push("/login"), 1500);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError("");
  };

  return (
    <>
      <Toaster position="top-center" />

      <div className="flex min-h-screen">
        {/* LEFT — Branding Panel */}
        <div className="hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary-300 via-primary-400 to-primary-500 p-12 lg:flex">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/90 shadow-lg">
            <span className="text-4xl font-black text-primary-500">N</span>
          </div>
          <h1 className="mb-4 text-center text-4xl font-bold text-neutral-900">
            Nyan Market
          </h1>
          <p className="max-w-sm text-center text-lg text-neutral-800/80">
            Nền tảng thương mại điện tử đa người bán.
            Tạo tài khoản để bắt đầu mua sắm thông minh.
          </p>
        </div>

        {/* RIGHT — Register Form */}
        <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400">
                <span className="text-xl font-bold text-neutral-900">N</span>
              </div>
              <span className="text-xl font-bold text-neutral-800">
                Nyan Market
              </span>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-neutral-800">
              Tạo tài khoản
            </h2>
            <p className="mb-8 text-neutral-500">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                Đăng nhập
              </Link>
            </p>

            {/* Server Error */}
            {serverError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Họ và tên
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className={`w-full rounded-xl border bg-neutral-50 py-3 pl-10 pr-4 text-neutral-800 outline-none transition-all placeholder:text-neutral-400 focus:bg-white focus:ring-2
                      ${errors.fullName ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"}`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="email@example.com"
                    className={`w-full rounded-xl border bg-neutral-50 py-3 pl-10 pr-4 text-neutral-800 outline-none transition-all placeholder:text-neutral-400 focus:bg-white focus:ring-2
                      ${errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    className={`w-full rounded-xl border bg-neutral-50 py-3 pl-10 pr-12 text-neutral-800 outline-none transition-all placeholder:text-neutral-400 focus:bg-white focus:ring-2
                      ${errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full rounded-xl border bg-neutral-50 py-3 pl-10 pr-12 text-neutral-800 outline-none transition-all placeholder:text-neutral-400 focus:bg-white focus:ring-2
                      ${errors.confirmPassword ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-primary-400 focus:ring-primary-100"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-400 py-3 font-semibold text-neutral-900 shadow-sm transition-all hover:bg-primary-500 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-neutral-400">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <span className="text-neutral-500 underline">
                Điều khoản dịch vụ
              </span>{" "}
              và{" "}
              <span className="text-neutral-500 underline">
                Chính sách bảo mật
              </span>{" "}
              của Nyan Market.
            </p>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        email={form.email}
        isOpen={otpModal}
        onClose={() => setOtpModal(false)}
        onVerify={handleVerifyOtp}
      />
    </>
  );
}
