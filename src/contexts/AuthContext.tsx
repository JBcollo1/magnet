// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '@/hooks/use-toast'; // Assuming you have this toast utility

// Helper function to check if error is an Axios error
const isAxiosError = (error: any): error is { response?: { data?: { msg: string } }, isAxiosError: true } => {
  return error && typeof error === 'object' && error.isAxiosError === true;
};

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
  created_at?: string; // Corresponds to 'dateJoined' on the frontend display
  updated_at?: string; // New: Corresponds to 'lastUpdated' on the frontend display
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
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  validateResetToken: (token: string) => Promise<string>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Updated isValidUser to account for new optional properties
  const isValidUser = (data: any): data is User => {
    return data &&
      typeof data.id === 'string' &&
      typeof data.email === 'string' &&
      typeof data.name === 'string' &&
      (data.role === 'ADMIN' || data.role === 'CUSTOMER' || data.role === 'STAFF') &&
      (typeof data.created_at === 'string' || data.created_at === undefined || data.created_at === null) && // Check for optional created_at
      (typeof data.updated_at === 'string' || data.updated_at === undefined || data.updated_at === null); // Check for optional updated_at
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await axios.get<User | AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        { withCredentials: true }
      );

      const userData = response.data;

      if (isValidUser(userData)) {
        return userData;
      }

      // If the response is an AuthResponse object containing a user
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
        const userData = response.data;

        // Prioritize AuthResponse.user if available
        if (userData && typeof userData === 'object' && 'user' in userData) {
          const authResponse = userData as AuthResponse;
          if (authResponse.user && isValidUser(authResponse.user)) {
            setUser(authResponse.user);
            return true;
          }
        }

        // Fallback to directly checking if response.data is a valid User
        if (isValidUser(userData)) {
          setUser(userData);
          return true;
        }

        // Final fallback: fetch user if login was successful but user data was not directly returned
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

        // Prioritize AuthResponse.user if available
        if (userData && typeof userData === 'object' && 'user' in userData) {
          const authResponse = userData as AuthResponse;
          if (authResponse.user && isValidUser(authResponse.user)) {
            setUser(authResponse.user);
            return true;
          }
        }

        // Fallback to directly checking if response.data is a valid User
        if (isValidUser(userData)) {
          setUser(userData);
          return true;
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      setUser(null);
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast({
          title: "Reset link sent",
          description: "Password reset link sent to your email!",
        });
      } else {
        throw new Error(response.data.message || "Failed to send reset link.");
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (token: string, password: string): Promise<void> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`,
        { password },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast({
          title: "Password reset successful",
          description: "Password reset successful! Redirecting to sign in...",
        });
      } else {
        throw new Error(response.data.message || "Failed to reset password.");
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw new Error(errorMessage);
    }
  };

  const validateResetToken = async (token: string): Promise<string> => {
    try {
      const response = await axios.get<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        const msg = response.data.message || 'Token is valid. You can now reset your password.';
        toast({
          title: "Token Validated",
          description: msg,
        });
        return msg;
      } else {
        throw new Error(response.data.message || "Invalid or expired reset token.");
      }
    } catch (error: unknown) {
      let errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw new Error(errorMessage);
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
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    forgotPassword,
    resetPassword,
    validateResetToken,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
