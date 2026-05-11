// client/src/services/auth.service.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ===== INTERFACES =====

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    otpExpiresAt: string;
  };
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserData {
  _id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  roles: string[];
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    user: UserData;
  };
}

export interface ApiResponse {
  success: boolean;
  message: string;
  code?: string;
  [key: string]: unknown;
}

// ===== API FUNCTIONS =====

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: RegisterResponse = await res.json();

    if (!res.ok) {
      throw new Error((data as ApiResponse).message || "Đăng ký thất bại");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Không thể kết nối đến server");
  }
}

export async function verifyOtp(
  payload: VerifyOtpPayload
): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: ApiResponse = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Xác thực OTP thất bại");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Không thể kết nối đến server");
  }
}

export async function loginUser(
  payload: LoginPayload
): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: LoginResponse = await res.json();

    if (!res.ok) {
      throw new Error((data as ApiResponse).message || "Đăng nhập thất bại");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Không thể kết nối đến server");
  }
}
