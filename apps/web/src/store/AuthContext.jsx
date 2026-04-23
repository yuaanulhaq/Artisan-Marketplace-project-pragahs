import { createContext, useContext, useEffect, useEffectEvent, useState } from "react";

import { clearStoredToken, getStoredToken, request, setStoredToken } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useEffectEvent(async () => {
    const activeToken = getStoredToken();

    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await request("/auth/me");
      setUser(response.user);
    } catch {
      clearStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    loadProfile();
  }, [token]);

  const login = async (credentials) => {
    const response = await request("/auth/login", {
      method: "POST",
      body: credentials
    });

    setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const signup = async (payload) => {
    const response = await request("/auth/signup", {
      method: "POST",
      body: payload
    });

    setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    const response = await request("/auth/me");
    setUser(response.user);
    return response.user;
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
