import axios from "axios";
import { User, Donation, SystemStats } from "../types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject Authorization Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("foodshare_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<{ user: User; token: string }>("/auth/login", credentials);
    return response.data;
  },
  register: async (data: {
    name: string;
    email: string;
    passwordHash?: string; // standard fields
    password?: string;
    role: string;
    phone: string;
    address: string;
    organizationName?: string;
  }) => {
    const response = await api.post<{ user: User; token: string }>("/auth/register", data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
};

export const statsApi = {
  getStats: async () => {
    const response = await api.get<SystemStats>("/stats");
    return response.data;
  },
};

export const donationsApi = {
  getAll: async () => {
    const response = await api.get<Donation[]>("/donations");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Donation>(`/donations/${id}`);
    return response.data;
  },
  create: async (data: Partial<Donation>) => {
    const response = await api.post<Donation>("/donations", data);
    return response.data;
  },
  update: async (id: string, data: Partial<Donation>) => {
    const response = await api.put<Donation>(`/donations/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: string, status: Donation["status"], notes?: { pickupNotes?: string; deliveryNotes?: string }) => {
    const response = await api.patch<Donation>(`/donations/${id}/status`, {
      status,
      ...notes,
    });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/donations/${id}`);
    return response.data;
  },
};

export const profileApi = {
  updateProfile: async (data: {
    name: string;
    phone: string;
    address: string;
    organizationName?: string;
    avatar?: string;
  }) => {
    const response = await api.put<User>("/users/profile", data);
    return response.data;
  },
};

export const contactApi = {
  sendMessage: async (data: { name: string; email: string; subject: string; message: string }) => {
    const response = await api.post<{ message: string }>("/contact", data);
    return response.data;
  },
  getMessages: async () => {
    const response = await api.get<any[]>("/contact");
    return response.data;
  },
};

export default api;
