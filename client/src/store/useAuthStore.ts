// client/src/store/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // <-- Biến sinh tử đây
  setAuth: (user: any | null, isAuthenticated: boolean) => void;
  setIsInitialized: (status: boolean) => void; // <-- Hàm cập nhật
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false, // Mặc định ban đầu là chưa khởi tạo
  
  setAuth: (user, isAuthenticated) => set({ user, isAuthenticated }),
  setIsInitialized: (status) => set({ isInitialized: status }),
  
  logout: () => {
    localStorage.removeItem("accessToken");
    set({ user: null, isAuthenticated: false, isInitialized: true });
  },
}));