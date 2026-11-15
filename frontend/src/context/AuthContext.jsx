import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('findit_access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('findit_access_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('findit_user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('findit_access_token');
          localStorage.removeItem('findit_refresh_token');
          localStorage.removeItem('findit_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      const { accessToken, refreshToken, user: userData } = res.data;
      localStorage.setItem('findit_access_token', accessToken);
      localStorage.setItem('findit_refresh_token', refreshToken);
      localStorage.setItem('findit_user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (data) => {
    const res = await authService.register(data);
    if (res.success && res.data) {
      const { accessToken, refreshToken, user: userData } = res.data;
      localStorage.setItem('findit_access_token', accessToken);
      localStorage.setItem('findit_refresh_token', refreshToken);
      localStorage.setItem('findit_user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('findit_user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateCurrentUser,
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

