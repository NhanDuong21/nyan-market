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
  payload: RegisterShopPayload
): Promise<RegisterShopResponse> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) throw new Error("Vui lòng đăng nhập trước khi đăng ký shop.");

    const res = await fetch(`${API_URL}/shops/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    const data: RegisterShopResponse = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Đăng ký mở quán thất bại");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Không thể kết nối đến server");
  }
}
