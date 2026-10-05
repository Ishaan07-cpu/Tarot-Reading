import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (userData: any) => Promise<any>;
  verifyEmail: (email: string, otp: string) => Promise<any>;
  resendOtp: (email: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tarot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('tarot_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('tarot_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('tarot_user', JSON.stringify(res.data.data));
          }
        } catch {
          // Token expired or invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('tarot_token');
          localStorage.removeItem('tarot_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { user: loggedInUser, token: authToken } = res.data.data;
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('tarot_user', JSON.stringify(loggedInUser));
      localStorage.setItem('tarot_token', authToken);
    }
    return res.data;
  };

  const signup = async (userData: any) => {
    const res = await api.post('/auth/signup', userData);
    return res.data;
  };

  const verifyEmail = async (email: string, otp: string) => {
    const res = await api.post('/auth/verify-email', { email, otp });
    if (res.data?.success) {
      const { user: verifiedUser, token: authToken } = res.data.data;
      setUser(verifiedUser);
      setToken(authToken);
      localStorage.setItem('tarot_user', JSON.stringify(verifiedUser));
      localStorage.setItem('tarot_token', authToken);
    }
    return res.data;
  };

  const resendOtp = async (email: string) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue cleanup on frontend regardless
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('tarot_token');
      localStorage.removeItem('tarot_user');
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.data);
        localStorage.setItem('tarot_user', JSON.stringify(res.data.data));
      }
    } catch {
      // Ignore
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    const res = await api.patch('/auth/profile', data);
    if (res.data?.success) {
      setUser(res.data.data);
      localStorage.setItem('tarot_user', JSON.stringify(res.data.data));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && user.isEmailVerified,
        isLoading,
        login,
        signup,
        verifyEmail,
        resendOtp,
        logout,
        refreshUser,
        updateProfile,
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
