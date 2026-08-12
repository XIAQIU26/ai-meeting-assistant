import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Module-level reference for non-React code to check auth state
let currentUser: User | null = null;

export function getCurrentUser(): User | null {
  return currentUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // 5 秒超时保护：无论 Supabase 是否响应，loading 都必须结束，避免页面卡死
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
        console.warn('Auth initialization timed out, proceeding without user');
      }
    }, 5000);

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      clearTimeout(timeout);
      setUser(data.user);
      currentUser = data.user;
      setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      clearTimeout(timeout);
      console.warn('Auth initialization failed:', err instanceof Error ? err.message : 'unknown');
      setUser(null);
      currentUser = null;
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      currentUser = session?.user ?? null;
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(email: string, password: string, name?: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name || email.split('@')[0] } }
    });
    if (!error && name) {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        await supabase.from('profiles').upsert({ id: newUser.id, name });
      }
    }
    return { error: error?.message || null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}