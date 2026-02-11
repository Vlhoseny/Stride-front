import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface User {
  email: string;
  fullName: string;
  jobTitle?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface StoredUser {
  password: string;
  fullName: string;
  jobTitle?: string;
  bio?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (email: string, password: string, fullName: string, jobTitle?: string, bio?: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<Omit<User, "email">>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "wf_users";
const SESSION_KEY = "wf_session";

function getUsers(): Record<string, StoredUser> {
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

  const register = useCallback((email: string, password: string, fullName: string, jobTitle?: string, bio?: string) => {
    const users = getUsers();
    if (users[email]) return { success: false, error: "An account with this email already exists." };
    users[email] = { password, fullName, jobTitle, bio };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    setUser({ email, fullName, jobTitle, bio });
    return { success: true };
  }, []);

  const login = useCallback((email: string, password: string) => {
    const users = getUsers();
    const u = users[email];
    if (!u) return { success: false, error: "No account found with this email." };
    if (u.password !== password) return { success: false, error: "Incorrect password." };
    setUser({ email, fullName: u.fullName, jobTitle: u.jobTitle, bio: u.bio, avatarUrl: u.avatarUrl });
    return { success: true };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateProfile = useCallback((updates: Partial<Omit<User, "email">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      const users = getUsers();
      if (users[prev.email]) {
        users[prev.email] = { ...users[prev.email], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      }
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
