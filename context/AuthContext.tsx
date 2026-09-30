'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { AuthUser, AuthSession } from '@/types/ops';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isDemo: boolean;
  role: string;
  isLoading: boolean;
  isSupabaseLive: boolean;
  loginWithJudgeDemo: () => void;
  loginWithSupabase: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateRole: (role: AuthUser['role']) => void;
}

const STORAGE_KEY = 'aetherops_auth_session';

const DEFAULT_JUDGE_USER: AuthUser = {
  id: 'judge-evaluator-demo-01',
  email: 'evaluator.judge@aetherops.internal',
  role: 'Judge/Evaluator',
  isDemo: true,
  fullName: 'Principal Evaluator (Autonomous Systems)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
  organization: 'Cloud Resilience AI Benchmark 2026',
  demoSessionStartedAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);

  // Initialize Auth state from LocalStorage or Supabase
  useEffect(() => {
    const initAuth = async () => {
      try {
        const live = isSupabaseConfigured();
        setIsSupabaseLive(live);

        // Check if a saved Demo Session exists in localStorage
        const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (stored) {
          try {
            const parsedSession: AuthSession = JSON.parse(stored);
            if (parsedSession && parsedSession.user) {
              setUser(parsedSession.user);
              setSession(parsedSession);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('[AetherOps Auth] Corrupted stored session removed:', e);
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        // If live Supabase is configured, check for existing Supabase session
        if (live) {
          const { data: { session: sbSession } } = await supabase.auth.getSession();
          if (sbSession?.user) {
            const sbUser: AuthUser = {
              id: sbSession.user.id,
              email: sbSession.user.email || 'user@aetherops.internal',
              role: (sbSession.user.user_metadata?.role as AuthUser['role']) || 'Site Reliability Engineer',
              isDemo: false,
              fullName: sbSession.user.user_metadata?.full_name || sbSession.user.email?.split('@')[0],
              organization: 'Cloud Ops Team',
            };
            setUser(sbUser);
            setSession({
              user: sbUser,
              token: sbSession.access_token,
              expiresAt: new Date(sbSession.expires_at! * 1000).toISOString(),
              isDemo: false,
            });
          }
        }
      } catch (err) {
        console.error('[AetherOps Auth] Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for live Supabase auth state changes if configured
    if (isSupabaseConfigured()) {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, sbSession) => {
        if (sbSession?.user) {
          const sbUser: AuthUser = {
            id: sbSession.user.id,
            email: sbSession.user.email || 'user@aetherops.internal',
            role: (sbSession.user.user_metadata?.role as AuthUser['role']) || 'Site Reliability Engineer',
            isDemo: false,
            fullName: sbSession.user.user_metadata?.full_name || sbSession.user.email?.split('@')[0],
            organization: 'Cloud Ops Team',
          };
          setUser(sbUser);
          setSession({
            user: sbUser,
            token: sbSession.access_token,
            expiresAt: new Date(sbSession.expires_at! * 1000).toISOString(),
            isDemo: false,
          });
        }
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, []);

  /**
   * ⚡ Instant One-Click Judge Demo Mode
   * Injects a persistent Demo Session immediately without requiring credentials.
   */
  const loginWithJudgeDemo = useCallback(() => {
    const demoUser: AuthUser = {
      ...DEFAULT_JUDGE_USER,
      demoSessionStartedAt: new Date().toISOString(),
    };

    const demoSession: AuthSession = {
      user: demoUser,
      token: 'jwt-aetherops-judge-demo-token-active-verified',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isDemo: true,
    };

    setUser(demoUser);
    setSession(demoSession);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoSession));
    }
  }, []);

  /**
   * Normal Login via Supabase JWT
   */
  const loginWithSupabase = useCallback(async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        // Simulated fallback when live Supabase credentials aren't bound yet
        const simulatedUser: AuthUser = {
          id: 'sre-auth-demo-99',
          email,
          role: 'Site Reliability Engineer',
          isDemo: false,
          fullName: email.split('@')[0].toUpperCase(),
          organization: 'Aether Cloud Infrastructure',
        };
        const simulatedSession: AuthSession = {
          user: simulatedUser,
          token: 'jwt-simulated-supabase-jwt-verified',
          isDemo: false,
        };
        setUser(simulatedUser);
        setSession(simulatedSession);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(simulatedSession));
        }
        return { success: true };
      }

      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user && data.session) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            role: 'Site Reliability Engineer',
            isDemo: false,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          };
          const newSession: AuthSession = {
            user: authUser,
            token: data.session.access_token,
            isDemo: false,
          };
          setUser(authUser);
          setSession(newSession);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
          }
          return { success: true };
        }
      } else {
        // Magic link
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }

      return { success: false, error: 'Authentication could not be completed' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected login error';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log out and clear state
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRole = useCallback((newRole: AuthUser['role']) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      if (session) {
        const updatedSession = { ...session, user: updatedUser };
        setSession(updatedSession);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
        }
      }
    }
  }, [user, session]);

  const isDemo = user?.isDemo ?? false;
  const role = user?.role ?? 'Guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isDemo,
        role,
        isLoading,
        isSupabaseLive,
        loginWithJudgeDemo,
        loginWithSupabase,
        logout,
        updateRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
