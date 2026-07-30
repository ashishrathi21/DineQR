import { create } from "zustand";
import axios from "axios";

// Using Vite's environment variables or defaulting to localhost
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_API_URL = rawApiUrl.endsWith("/auth") ? rawApiUrl : `${rawApiUrl}/auth`;

// Axios defaults setup
axios.defaults.withCredentials = true;
const initialToken = localStorage.getItem("token");
if (initialToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Check if user is logged in
  verifyAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${AUTH_API_URL}/me`);
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      }
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || "Login failed", isLoading: false });
      return false;
    }
  },

  // Register
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${AUTH_API_URL}/register`, userData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      }
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || "Registration failed", isLoading: false });
      return false;
    }
  },

  // Google Login / Registration
  googleLogin: async (googleData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${AUTH_API_URL}/google`, googleData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      }
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || "Google authentication failed", isLoading: false });
      return false;
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${AUTH_API_URL}/logout`);
    } catch (error) {
      console.error("Logout request error:", error);
    } finally {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  
  clearError: () => set({ error: null })
}));
