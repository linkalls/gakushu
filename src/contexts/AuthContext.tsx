'use client';

import { createContext, useContext, useCallback, type PropsWithChildren } from 'react';
import { useSession, signIn, signUp, signOut } from '@/lib/auth-client';
import type { User } from '@/db/schema';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const { data, isPending } = useSession();

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn.email({
      email,
      password,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const result = await signUp.email({
      email,
      password,
      name,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  }, []);

  const logout = useCallback(async () => {
    const result = await signOut();

    if (result.error) {
      throw new Error(result.error.message);
    }
  }, []);

  const value: AuthContextType = {
    user: (data?.user as User) || null,
    isAuthenticated: !!data?.user,
    isLoading: isPending,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
