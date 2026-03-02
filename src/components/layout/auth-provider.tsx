"use client";

import { BOOKING_ALLOWED_KEY } from "@/lib/constant";
import type { GetProfileDataType } from "@/types/auth/user";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type AuthContextType = {
  user: GetProfileDataType | null;
  loading: boolean;
  setUser: (user: GetProfileDataType | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
  initialUser?: GetProfileDataType | null;  // ⬅️ from server component
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUserState] = useState<GetProfileDataType | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser); // if we already have user, no loading

  const setUser = (value: GetProfileDataType | null) => {
    setUserState(value);
    localStorage.setItem("ses_user", JSON.stringify(value));
  };

  const fetchSession = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/session", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUserState(null);
      } else {
        const data = await res.json();
        setUserState(data.user ?? null);
      }
    } catch (err) {
      console.error("Failed to fetch session", err);
      setUserState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If server already passed a user, we skip the initial fetch
    if (!initialUser) {
      void fetchSession();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("ses_user");
      localStorage.removeItem(BOOKING_ALLOWED_KEY);
      setUserState(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        refresh: fetchSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
