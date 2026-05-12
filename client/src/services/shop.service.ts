// client/src/services/shop.service.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ===== INTERFACES =====

export interface ShopAddress {
  province: string;
  district: string;
  ward: string;
  street: string;
}

export interface RegisterShopPayload {
  shopName: string;
  description?: string;
  phone: string;
  address: ShopAddress;
  categories?: string[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  code?: string;
  [key: string]: any;
}

export interface RegisterShopResponse extends ApiResponse {
  data?: {
    shop: any;
  };
}

// ===== API FUNCTIONS =====

export async function registerShop(
  payload: RegisterShopPayload | FormData
): Promise<RegisterShopResponse> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) throw new Error("Vui lòng đăng nhập trước khi đăng ký shop.");

    const isFormData = payload instanceof FormData;
    
    // Do not set Content-Type if FormData, let browser set boundary
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`
    };
    
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_URL}/shops/register`, {
      method: "POST",
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    });

    const data: RegisterShopResponse = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Đăng ký mở quán thất bại");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Không thể kết nối đến server");
  }
}
