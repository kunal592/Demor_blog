import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import apiClient from '../services/apiClient';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useProvideAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshAuth = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/auth/me');
            if (response.data.data.user) {
                setUser(response.data.data.user);
            } else {
                setUser(null);
                localStorage.removeItem('token');
            }
        } catch (error) {
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            refreshAuth();
        } else {
            setLoading(false);
        }
    }, [refreshAuth]);

    const login = async (credential: string) => {
        const response = await apiClient.post('/auth/login', { credential });
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
    };

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch(error) {
            console.error(error)
        } finally {
            localStorage.removeItem('token');
            delete apiClient.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    return {
        user,
        loading,
        login,
        logout,
        refreshAuth,
    };
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const auth = useProvideAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}
