import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data);
    } catch (err) {
      console.error('Session validation error:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (formData: any) => {
    const { data } = await authApi.register(formData);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }
    localStorage.clear();
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    if (user.is_superuser) return true;
    if (!user.permissions) return false;
    const req = `${resource}:${action}`;
    const manageReq = `${resource}:manage`;
    return (
      user.permissions.includes(req) ||
      user.permissions.includes(manageReq) ||
      user.permissions.includes('*:*')
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
