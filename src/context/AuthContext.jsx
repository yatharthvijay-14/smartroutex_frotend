import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("smart_road_token");
      const savedUser  = localStorage.getItem("smart_road_user");

      // Purge legacy demo sessions so all users must sign in with real credentials
      if (savedToken === "demo_token_smart_road_2026") {
        localStorage.removeItem("smart_road_token");
        localStorage.removeItem("smart_road_user");
        setToken(null);
        setUser(null);
      } else if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Standard credential login (auto-login after sign in) ────────────────────
  const login = async (username, password) => {
    const data = await loginUser(username, password);
    if (data && data.token) {
      const userObj = { username: data.username, email: data.email, role: data.role };
      setToken(data.token);
      setUser(userObj);
      localStorage.setItem("smart_road_token", data.token);
      localStorage.setItem("smart_road_user", JSON.stringify(userObj));
      return { success: true, user: userObj };
    }
    throw new Error(data?.error || "Login failed.");
  };

  // ─── Standard registration (NO auto-login, must sign in after) ───────────────
  const register = async (username, email, password, role) => {
    const data = await registerUser(username, email, password, role);
    // Server returns error as 400 → axios throws → caught upstream
    // If we reach here, registration succeeded
    if (data && (data.token || data.username)) {
      // Do NOT set token/user — force manual sign-in
      return {
        success: true,
        username: data.username,
        message: "Account registered successfully! Please sign in with your credentials to launch dashboard."
      };
    }
    throw new Error(data?.error || "Registration failed.");
  };

  // ─── Google Sign-In (existing account, auto-login) ────────────────────────────
  const loginWithGoogle = async (email, name, password, role = "ROLE_USER") => {
    const { googleLoginUser } = await import("../services/api");
    const data = await googleLoginUser(email, name, password, role);
    if (data && data.token) {
      const userObj = { username: data.username, email: data.email, role: data.role };
      setToken(data.token);
      setUser(userObj);
      localStorage.setItem("smart_road_token", data.token);
      localStorage.setItem("smart_road_user", JSON.stringify(userObj));
      return { success: true, user: userObj };
    }
    throw new Error(data?.error || "Google Sign-In failed.");
  };

  // ─── Google Register (new account, NO auto-login, must sign in after) ─────────
  const registerWithGoogle = async (email, name, password, role = "ROLE_USER") => {
    const { googleRegisterUser } = await import("../services/api");
    const data = await googleRegisterUser(email, name, password, role);
    if (data && (data.username || data.message)) {
      // Do NOT set token/user — force manual sign-in
      return {
        success: true,
        username: data.username,
        message: data.message || "Google account registered! Please sign in to launch dashboard."
      };
    }
    throw new Error(data?.error || "Google registration failed.");
  };

  // ─── Logout ───────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("smart_road_token");
    localStorage.removeItem("smart_road_user");
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAdmin: user?.role === "ROLE_ADMIN",
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    loginWithGoogle,
    registerWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
