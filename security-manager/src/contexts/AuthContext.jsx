import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load user and token from localStorage on mount
   */
  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    const savedUser = localStorage.getItem("USER");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await axiosClient.get("/user");
        setUser(data);
        setIsAuthenticated(true);
        localStorage.setItem("USER", JSON.stringify(data)); // ✅ keep it synced
      } catch (error) {
        console.error("Failed to fetch user:", error);
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("USER");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const { data } = await axiosClient.post("/login", { email, password });

      if (data.token) {
        localStorage.setItem("ACCESS_TOKEN", data.token);
        localStorage.setItem("USER", JSON.stringify(data.user)); // ✅ save user
        setIsAuthenticated(true);
        setUser(data.user);
        return { success: true, user: data.user };
      }

      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  /**
   * Register user
   */
  const register = async (name, email, password, role) => {
    try {
      const { data } = await axiosClient.post("/register", {
        name,
        email,
        password,
        password_confirmation: password,
        role,
      });

      if (data.token) {
        localStorage.setItem("ACCESS_TOKEN", data.token);
        localStorage.setItem("USER", JSON.stringify(data.user)); // ✅ save user
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      }

      return { success: false, message: "Registration failed" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch (error) {
      console.warn("Logout request failed:", error);
    } finally {
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("USER");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
