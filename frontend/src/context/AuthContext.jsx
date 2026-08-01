import { createContext, useContext, useState, useEffect, useCallback } from "react";
import AuthService from "../services/AuthService.js";
import { TOKEN_STORAGE_KEY } from "../constants/auth.js";

const AuthContext = createContext(null);

/**
 * Owns the JWT and current user. On mount, if a token is already in
 * localStorage (from a previous visit), it's validated against
 * GET /auth/me — an expired or tampered token is cleared rather than
 * left around looking valid while every real request 401s.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    AuthService.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { access_token } = await AuthService.login(email, password);
  
    localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
  
    // Make axios send the token before calling /me
    setToken(access_token);
  
    const me = await AuthService.me();
    setUser(me);
  }, []);

  const register = useCallback(async (email, password) => {
    const { access_token } = await AuthService.register(email, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
    setToken(access_token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, loading, isAuthenticated: Boolean(token && user), login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
