import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user?: User;
  success?: boolean;
  message?: string;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Type guard to validate user data
  const isValidUser = (data: any): data is User => {
    return data &&
           typeof data.id === 'string' &&
           typeof data.email === 'string' &&
           typeof data.name === 'string';
  };

  // Function to get current user from backend
  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await axios.get<User | AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        { withCredentials: true }
      );

      // Handle different response formats
      const userData = response.data;

      // If response.data is directly a User object
      if (isValidUser(userData)) {
        return userData;
      }

      // If response.data has a user property
      if (userData && typeof userData === 'object' && 'user' in userData) {
        const authResponse = userData as AuthResponse;
        if (authResponse.user && isValidUser(authResponse.user)) {
          return authResponse.user;
        }
      }

      return null;
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
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Try to get user data from the response first
        const userData = response.data;

        // Check if user data is in the response
        if (userData && typeof userData === 'object' && 'user' in userData) {
          const authResponse = userData as AuthResponse;
          if (authResponse.user && isValidUser(authResponse.user)) {
            setUser(authResponse.user);
            return true;
          }
        }

        // If user data is directly in response
        if (isValidUser(userData)) {
          setUser(userData);
          return true;
        }

        // If no user data in response, try to fetch it
        const userFromApi = await getCurrentUser();
        if (userFromApi) {
          setUser(userFromApi);
          return true;
        }

        return false;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        { email, password, name },
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        const userData = response.data;

        if (userData && typeof userData === 'object' && 'user' in userData) {
          const authResponse = userData as AuthResponse;
          if (authResponse.user && isValidUser(authResponse.user)) {
            setUser(authResponse.user);
            return true;
          }
        }

        if (isValidUser(userData)) {
          setUser(userData);
          return true;
        }

        // If no user data in response, registration was successful
        // but user needs to login (common for email verification flows)
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      setUser(null);
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );

      if (response.status === 200) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Forgot password failed:', error);
      return false;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`,
        { password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Reset password failed:', error);
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
      // Continue with logout even if request fails
    } finally {
      // Always clear user state on logout
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    forgotPassword,
    resetPassword,
    logout,
    isAuthenticated: !!user,
    loading,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

