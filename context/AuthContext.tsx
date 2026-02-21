import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/services/api/types';
import * as authApi from '@/services/api/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const currentUser = await authApi.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Login failed');
      throw err;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const response = await authApi.register({ name, email, password });
      setUser(response.user);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Registration failed');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await authApi.logout();
      setUser(null);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Logout failed');
      throw err;
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    setError(null);
    try {
      await authApi.verifyEmail(token);
      setUser(prev => prev ? { ...prev, emailVerified: true } : null);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Email verification failed');
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setError(null);
    try {
      await authApi.resetPassword(token, newPassword);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Password reset failed');
      throw err;
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    setError(null);
    try {
      await authApi.requestPasswordReset(email);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Password reset request failed');
      throw err;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    verifyEmail,
    resetPassword,
    requestPasswordReset,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
