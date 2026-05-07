import { create } from "zustand";

interface User {
  id: string;
  email: string;
  plan: "free" | "pro";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem("dus_access_token", accessToken);
    localStorage.setItem("dus_refresh_token", refreshToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("dus_access_token");
    localStorage.removeItem("dus_refresh_token");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  hydrateFromStorage: () => {
    const token = localStorage.getItem("dus_access_token");
    if (!token) return;

    // Decode JWT payload (no verification — server validates)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("dus_access_token");
        localStorage.removeItem("dus_refresh_token");
        return;
      }
      set({
        user: { id: payload.sub, email: payload.email, plan: payload.plan },
        accessToken: token,
        isAuthenticated: true,
      });
    } catch {
      // Malformed token
      localStorage.removeItem("dus_access_token");
    }
  },
}));
