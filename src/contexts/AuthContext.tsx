'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  pubsubToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthorized: (roles: User['role'][]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pubsubToken, setPubsubToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/chatwoot/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({ ...data.user, isActive: true });
            setPubsubToken(data.pubsubToken || null);
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/chatwoot/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur de connexion');
    }

    const userData = await res.json();
    setUser({ ...userData, isActive: true });
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/chatwoot/auth', { method: 'DELETE' });
    setUser(null);
    setPubsubToken(null);
    window.location.href = '/login';
  }, []);

  const isAuthorized = useCallback(
    (roles: User['role'][]) => !!user && roles.includes(user.role),
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, pubsubToken, login, logout, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
