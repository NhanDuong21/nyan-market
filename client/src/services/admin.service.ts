// client/src/services/admin.service.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface AdminShop {
  _id: string;
  shopName: string;
  phone: string;
  status: "pending" | "active" | "rejected";
  createdAt: string;
  owner: {
    fullName: string;
    email: string;
  };
  kyc: {
    idCardFront: string;
    idCardBack: string;
  };
}

export interface AdminApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const adminService = {
  /**
   * Lấy danh sách shop theo trạng thái
   */
  getShops: async (status?: string): Promise<AdminShop[]> => {
    const token = localStorage.getItem("accessToken");
    const url = new URL(`${API_URL}/admin/shops`);
    if (status) url.searchParams.append("status", status);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Không thể tải danh sách shop");
    return data.data.shops;
  },

  /**
   * Phê duyệt shop
   */
  approveShop: async (id: string): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_URL}/admin/shops/${id}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Phê duyệt thất bại");
  },

  /**
   * Từ chối shop
   */
  rejectShop: async (id: string, rejectionReason: string): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_URL}/admin/shops/${id}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rejectionReason }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Từ chối thất bại");
  },
};
