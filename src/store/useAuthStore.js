import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_NEXT_PUBLIC_API_URL;

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("syntra-auth");
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  }
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ─── Zustand Store ────────────────────────────────────────────────────────────
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      signup: async (name, email, password, role = "learner") => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post("auth/signup", { name, email, password, role });
          set({ user: data.user, token: data.token, isLoading: false, error: null });
          return { success: true, data };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post("auth/login", { email, password });
          set({ user: data.user, token: data.token, isLoading: false, error: null });
          return { success: true, data };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post("auth/forgot-password", { email });
          set({ isLoading: false, error: null });
          return { success: true, data };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      resetPassword: async (token, password, passwordConfirm) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post(`auth/reset-password/${token}`, { password, passwordConfirm });
          set({ isLoading: false, error: null });
          return { success: true, data };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      loginWithGoogle: () => {
        window.location.href = `${API_BASE_URL}auth/google`;
      },

      loginWithGithub: () => {
        window.location.href = `${API_BASE_URL}auth/github`;
      },

      logout: async () => {
        try {
          await api.post("auth/logout");
        } catch (_) {}
        set({ user: null, token: null, error: null, isLoading: false });
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true, error: null });
        try {
          const data = await api.get("auth/me");
          set({ user: data.user, isLoading: false });
        } catch (err) {
          set({ user: null, token: null, isLoading: false, error: err.message });
        }
      },

      uploadProfilePhoto: async (file) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append("image", file);
          const data = await api.post("user/upload-profile-photo", formData, {
            transformRequest: [
              (payload, headers) => {
                if (typeof FormData !== "undefined" && payload instanceof FormData) {
                  delete headers["Content-Type"];
                }
                return payload;
              },
            ],
          });
          const partial = data.user;
          if (partial) {
            set((state) => ({
              user: state.user ? { ...state.user, ...partial } : partial,
              isLoading: false,
              error: null,
            }));
          } else {
            set({ isLoading: false, error: null });
          }
          return { success: true, data };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "syntra-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;
