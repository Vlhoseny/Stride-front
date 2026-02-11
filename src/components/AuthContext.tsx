import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface User {
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (email: string, password: string, fullName: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "wf_users";
const SESSION_KEY = "wf_session";

function getUsers(): Record<string, { password: string; fullName: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const register = useCallback((email: string, password: string, fullName: string) => {
    const users = getUsers();
    if (users[email]) return { success: false, error: "An account with this email already exists." };
    users[email] = { password, fullName };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    setUser({ email, fullName });
    return { success: true };
  }, []);

  const login = useCallback((email: string, password: string) => {
    const users = getUsers();
    const u = users[email];
    if (!u) return { success: false, error: "No account found with this email." };
    if (u.password !== password) return { success: false, error: "Incorrect password." };
    setUser({ email, fullName: u.fullName });
    return { success: true };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
