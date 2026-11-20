"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState<string | null>(null);

  const ensureGuestSession = useCallback(async () => {
    if (!configured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) {
        throw signInError;
      }

      setUser(data.user);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create a guest session.";
      setError(message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void ensureGuestSession();
    }, 0);

    if (!configured) {
      return () => window.clearTimeout(timer);
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [configured, ensureGuestSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      error,
      refresh: ensureGuestSession,
    }),
    [user, loading, configured, error, ensureGuestSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
