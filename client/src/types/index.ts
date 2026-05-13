// client/src/types/index.ts

// ===== USER =====
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

// ===== SHOP =====
export interface ShopAddress {
  province: string;
  district: string;
  ward: string;
  street: string;
}

export interface Shop {
  _id: string;
  owner: string | UserData;
  shopName: string;
  slug: string;
  description: string;
  phone: string;
  address: ShopAddress;
  status: "pending" | "active" | "rejected" | "banned";
  createdAt: string;
  updatedAt: string;
}

// ===== PRODUCT =====
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  price: number;
  originalPrice: number | null;
  stock: number;
  status: "active" | "inactive" | "out_of_stock" | "hidden";
  stats: {
    totalSold: number;
    rating: number;
    totalReviews: number;
    viewCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ===== CATEGORY =====
export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
}

// ===== API =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

// ===== ADMIN =====
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
