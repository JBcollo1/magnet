import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to get current user from backend
  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  };

  // Function to refresh user data
  const refreshUser = async (): Promise<void> => {
    setLoading(true);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check for existing authentication on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        // After successful login, get user data
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        { email, password, name },
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        // After successful signup, get user data
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Logout request failed:', error);
      // Still clear user data even if logout request fails
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout: logout,
      isAuthenticated: !!user,
      loading,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};