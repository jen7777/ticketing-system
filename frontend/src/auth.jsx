import { useEffect, useMemo, useState } from "react";
import API from "./api";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const clearSession = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get("/auth/me");
        setUser(response.data);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, [token]);

  const signIn = (authPayload) => {
    localStorage.setItem("authToken", authPayload.token);
    setToken(authPayload.token);
    setUser(authPayload.user);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      signIn,
      logout: clearSession,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
