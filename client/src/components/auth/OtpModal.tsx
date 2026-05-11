"use client";
// client/src/components/auth/OtpModal.tsx

import { useState, useRef, useEffect } from "react";
import { X, Loader2, ShieldCheck } from "lucide-react";

interface OtpModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
}

export default function OtpModal({
  email,
  isOpen,
  onClose,
  onVerify,
}: OtpModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(""));
      setError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take last digit only
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace → focus previous
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus last filled or next empty
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onVerify(otpString);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xác thực thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
            <ShieldCheck size={28} className="text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800">Xác thực OTP</h2>
          <p className="text-center text-sm text-neutral-500">
            Mã xác thực 6 số đã được gửi đến
            <br />
            <span className="font-medium text-neutral-700">{email}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="mb-4 flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`h-12 w-12 rounded-xl border-2 text-center text-xl font-bold outline-none transition-all
                ${error ? "border-red-300 bg-red-50" : "border-neutral-200 bg-neutral-50"}
                focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-center text-sm text-red-500">{error}</p>
        )}

        {/* Timer hint */}
        <p className="mb-6 text-center text-xs text-neutral-400">
          Mã có hiệu lực trong 5 phút
        </p>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || otp.join("").length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-400 py-3 font-semibold text-neutral-900 transition-all hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang xác thực...
            </>
          ) : (
            "Xác nhận"
          )}
        </button>
      </div>
    </div>
  );
}
