// client/src/services/product.service.ts
import type { Product } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Lấy token từ localStorage (client-side only).
 */
const getToken = (): string | null => {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
};

// ===== API FUNCTIONS =====

/**
 * Lấy danh sách sản phẩm của merchant hiện tại.
 * Yêu cầu: Đã đăng nhập với role merchant.
 */
export async function getMerchantProducts(): Promise<Product[]> {
  const token = getToken();
  if (!token) throw new Error("Vui lòng đăng nhập để xem sản phẩm.");

  const res = await fetch(`${API_URL}/products/my-products`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Không thể lấy danh sách sản phẩm");
  }

  const data = await res.json();
  return data.data?.products || [];
}

/**
 * Lấy danh sách sản phẩm công khai (cho trang chủ).
 */
export async function getPublicProducts(params?: {
  category?: string;
  limit?: number;
  page?: number;
}): Promise<{ products: Product[]; pagination: { total: number; page: number; limit: number; pages: number } }> {
  const url = new URL(`${API_URL}/products`);
  if (params?.category) url.searchParams.append("category", params.category);
  if (params?.limit) url.searchParams.append("limit", String(params.limit));
  if (params?.page) url.searchParams.append("page", String(params.page));

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!data.success) throw new Error(data.message || "Không thể tải sản phẩm");
  return data.data;
}
