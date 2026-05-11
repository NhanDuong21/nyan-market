"use client";
// client/src/app/(auth)/login/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { loginUser } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ===== CLIENT VALIDATION =====
  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};
    if (!form.email.trim()) errs.email = "Vui lòng nhập email";
    if (!form.password) errs.password = "Vui lòng nhập mật khẩu";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ===== SUBMIT LOGIN =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await loginUser({
        email: form.email,
        password: form.password,
      });

      if (data.data) {
        // Lưu token và user vào localStorage
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        toast.success("Đăng nhập thành công!");
        setTimeout(() => router.push("/"), 800);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
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
            Chào mừng trở lại! Đăng nhập để tiếp tục mua sắm.
          </p>
        </div>

        {/* RIGHT — Login Form */}
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
              Đăng nhập
            </h2>
            <p className="mb-8 text-neutral-500">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                Đăng ký ngay
              </Link>
            </p>

            {/* Server Error */}
            {serverError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Nhập mật khẩu"
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
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary-500 hover:text-primary-600"
                >
                  Quên mật khẩu?
                </button>
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
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs text-neutral-400">HOẶC</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            {/* Social Login Placeholder */}
            <div className="space-y-3">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Đăng nhập với Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
