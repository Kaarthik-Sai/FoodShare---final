import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { authApi, profileApi } from "../lib/api";

interface Notification {
  message: string;
  type: "success" | "error";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  notification: Notification | null;
  showNotification: (message: string, type: "success" | "error") => void;
  clearNotification: () => void;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password?: string;
    role: string;
    phone: string;
    address: string;
    organizationName?: string;
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: {
    name: string;
    phone: string;
    address: string;
    organizationName?: string;
    avatar?: string;
  }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("foodshare_token"));
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  // Automatically clear notifications after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load user profile on startup if token is present
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
        } catch (error) {
          console.error("Session restoration failed:", error);
          // Token is expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      const data = await authApi.login(credentials);
      localStorage.setItem("foodshare_token", data.token);
      setToken(data.token);
      setUser(data.user);
      showNotification(`Welcome back, ${data.user.name}!`, "success");
      return data.user;
    } catch (error: any) {
      const msg = error.response?.data?.message || "Login failed. Please check credentials.";
      showNotification(msg, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (regData: any) => {
    try {
      setLoading(true);
      const data = await authApi.register(regData);
      localStorage.setItem("foodshare_token", data.token);
      setToken(data.token);
      setUser(data.user);
      showNotification("Account created successfully! Welcome to FoodShare.", "success");
      return data.user;
    } catch (error: any) {
      const msg = error.response?.data?.message || "Registration failed.";
      showNotification(msg, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("foodshare_token");
    setToken(null);
    setUser(null);
    showNotification("You have logged out successfully.", "success");
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const profile = await authApi.getMe();
        setUser(profile);
      } catch (err) {
        console.error("Failed to refresh user profile", err);
      }
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const updated = await profileApi.updateProfile(profileData);
      setUser(updated);
      showNotification("Profile updated successfully!", "success");
      return updated;
    } catch (error: any) {
      const msg = error.response?.data?.message || "Profile update failed.";
      showNotification(msg, "error");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        notification,
        showNotification,
        clearNotification,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
