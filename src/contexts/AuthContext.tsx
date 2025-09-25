import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authService } from '../services/authService';

// ---------------------------------------
// Context Types
// ---------------------------------------
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  isAuthenticated: boolean;
}

// ---------------------------------------
// Context Setup
// ---------------------------------------
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ---------------------------------------
// Auth Provider Hook
// ---------------------------------------
export const useProvideAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * 🔄 Refresh auth state (get `/auth/me`)
   */
  const refreshAuth = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.warn('Auth refresh failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🟢 On mount, restore token + check session
   */
  useEffect(() => {
    authService.restoreToken();
    refreshAuth();
  }, [refreshAuth]);

  /**
   * 🔑 Login with Google
   */
  const login = async (credential: string) => {
    const { user, token } = await authService.googleLogin(credential);
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
  };

  /**
   * 🚪 Logout
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    login,
    logout,
    refreshAuth,
    isAuthenticated,
  };
};

// ---------------------------------------
// AuthProvider Component
// ---------------------------------------
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
