import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('learnhub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('learnhub_token'));
  const [loading, setLoading] = useState(true);

  // Sync / verify user session on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('learnhub_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('learnhub_user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.warn('Session expired or invalid:', error.message);
        localStorage.removeItem('learnhub_token');
        localStorage.removeItem('learnhub_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = response.data;
    
    localStorage.setItem('learnhub_token', receivedToken);
    localStorage.setItem('learnhub_user', JSON.stringify(receivedUser));
    
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async ({ name, email, password, role }) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { token: receivedToken, user: receivedUser } = response.data;

    localStorage.setItem('learnhub_token', receivedToken);
    localStorage.setItem('learnhub_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Proceed with client logout even if backend is offline
    }
    localStorage.removeItem('learnhub_token');
    localStorage.removeItem('learnhub_user');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (profileData) => {
    const response = await api.patch('/auth/profile', profileData);
    if (response.data.success) {
      setUser(response.data.user);
      localStorage.setItem('learnhub_user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
