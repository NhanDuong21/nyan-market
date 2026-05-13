// client/src/store/useAuthStore.ts
import { create } from "zustand";
import { UserData } from "@/services/auth.service";

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: UserData) => void;
  clearAuth: () => void;
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  setAuth: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
  setInitialized: (value) => set({ isInitialized: value }),
}));
