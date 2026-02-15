import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { sanitizeInput } from "@/lib/sanitize";
import { registerUnauthorizedHandler, clearUnauthorizedHandler } from "@/api/apiClient";
import type { User, StoredUser } from "@/types";

// Re-export for backward compat
export type { User, StoredUser };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, jobTitle?: string, bio?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<User, "email">>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "wf_users";
const SESSION_KEY = "wf_session";

// ── Password hashing via Web Crypto (SHA-256) ──────────
async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Session schema validation ──────────────────────────
function isValidSession(obj: unknown): obj is User {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.email === "string" &&
    o.email.length > 0 &&
    typeof o.fullName === "string"
  );
}

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
      if (!s) return null;
      const parsed = JSON.parse(s);
      // Validate restored session against expected schema
      if (!isValidSession(parsed)) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      // Verify the user still exists in the user store
      const users = getUsers();
      if (!users[parsed.email]) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const register = useCallback(async (email: string, password: string, fullName: string, jobTitle?: string, bio?: string) => {
    const users = getUsers();
    if (users[email]) return { success: false, error: "An account with this email already exists." };
    const passwordHash = await hashPassword(password);
    const safeName = sanitizeInput(fullName);
    const safeJob = jobTitle ? sanitizeInput(jobTitle) : undefined;
    const safeBio = bio ? sanitizeInput(bio) : undefined;
    users[email] = { passwordHash, fullName: safeName, jobTitle: safeJob, bio: safeBio };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    setUser({ email, fullName: safeName, jobTitle: safeJob, bio: safeBio });
    return { success: true };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const users = getUsers();
    const u = users[email];
    if (!u) return { success: false, error: "No account found with this email." };
    // Support both legacy plaintext and new hashed passwords
    const passwordHash = await hashPassword(password);
    const isLegacy = !u.passwordHash && (u as unknown as { password?: string }).password === password;
    if (u.passwordHash !== passwordHash && !isLegacy) return { success: false, error: "Incorrect password." };
    // Migrate legacy users to hashed passwords
    if (isLegacy) {
      const { password: _pw, ...rest } = u as unknown as StoredUser & { password: string };
      users[email] = { ...rest, passwordHash };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
    setUser({ email, fullName: u.fullName, jobTitle: u.jobTitle, bio: u.bio, avatarUrl: u.avatarUrl });
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    // Clear all user-owned data from localStorage
    localStorage.removeItem("wf_projects");
    localStorage.removeItem("stride_tutorial_completed");
    localStorage.removeItem("stride_last_open_date");
    // Clear all per-project task boards
    Object.keys(localStorage)
      .filter((k) => k.startsWith("stride_tasks_"))
      .forEach((k) => localStorage.removeItem(k));
    // Clear session (also handled by the useEffect, but be explicit)
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  // Register logout as the global 401 handler for apiClient
  useEffect(() => {
    registerUnauthorizedHandler(logout);
    return () => clearUnauthorizedHandler();
  }, [logout]);

  const updateProfile = useCallback((updates: Partial<Omit<User, "email">>) => {
    // Sanitize all string fields before storing
    const sanitized: Partial<Omit<User, "email">> = {};
    for (const [key, val] of Object.entries(updates)) {
      (sanitized as Record<string, unknown>)[key] =
        typeof val === "string" ? sanitizeInput(val) : val;
    }
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...sanitized };
      const users = getUsers();
      if (users[prev.email]) {
        users[prev.email] = { ...users[prev.email], ...sanitized };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      }
      return next;
    });
  }, []);

  // Memoize context value to prevent cascading re-renders
  const contextValue = useMemo<AuthContextType>(
    () => ({ user, login, register, logout, updateProfile }),
    [user, login, register, logout, updateProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
