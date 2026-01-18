import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setLogoutHandler } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token") || null
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token") || null
  );
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (access, refresh, userData, rememberMe = false) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(userData);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("access_token", access);
    storage.setItem("refresh_token", refresh);
    if (userData) {
      storage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    setLogoutHandler(logout);
  }, [navigate]);

  const updateAccessToken = (newToken) => {
    setAccessToken(newToken);
    if (localStorage.getItem("access_token")) {
      localStorage.setItem("access_token", newToken);
    }
    if (sessionStorage.getItem("access_token")) {
      sessionStorage.setItem("access_token", newToken);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        login,
        logout,
        updateAccessToken,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
