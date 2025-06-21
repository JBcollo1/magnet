import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';


const isAxiosError = (error: any): error is { response?: { data?: { msg: string } }, isAxiosError: true } => {
  return error && typeof error === 'object' && (error as any).isAxiosError === true;
};

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
  created_at?: string;
  updated_at?: string;
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
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isValidUser = (data: any): data is User => {
    return data &&
      typeof data.id === 'string' &&
      typeof data.email === 'string' &&
      typeof data.name === 'string' &&
      (data.role === 'ADMIN' || data.role === 'CUSTOMER' || data.role === 'STAFF') &&
      (typeof data.created_at === 'string' || data.created_at === undefined || data.created_at === null) &&
      (typeof data.updated_at === 'string' || data.updated_at === undefined || data.updated_at === null);
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
    } finally {
      setLoading(false);
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
        toast.success("Reset link sent", {
          description: response.data.message || "Password reset link sent to your email!",
        });
      } else {
        throw new Error(response.data.message || "Failed to send reset link with unexpected status.");
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error("Error", {
        description: errorMessage,
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
        toast.success("Password reset successful", {
          description: "Password reset successful! Redirecting to sign in...",
        });
      } else {
        throw new Error(response.data.message || "Failed to reset password with unexpected status.");
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error("Error", {
        description: errorMessage,
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
        toast.info("Token Validated", {
          description: msg,
        });
        return msg;
      } else {
        throw new Error(response.data.message || "Invalid or expired reset token with unexpected status.");
      }
    } catch (error: unknown) {
      let errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error("Error", {
        description: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("Password changed successfully", {
          description: response.data.message || "Your password has been updated successfully!",
        });
      } else {
        throw new Error(response.data.message || "Failed to change password with unexpected status.");
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error("Error", {
        description: errorMessage,
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
      setUser(null);
    } catch (error) {
      console.error('Logout request failed:', error);
      toast.error("Logout Failed", {
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const logoutAllDevices = async (): Promise<void> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/logout-all`,
        {},
        { withCredentials: true }
      );
      toast.success("Logged out from all devices", {
        description: response.data.message || "All active sessions have been terminated for security.",
      });
      setUser(null);
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error("Logout All Failed", {
        description: errorMessage,
      });
      console.error('Logout all devices request failed:', error);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      const response = await axios.delete<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/auth/delete-account`,
        { withCredentials: true }
      );
      toast.success("Account deletion initiated", {
        description: response.data.message || "You will receive a confirmation email within 5 minutes.",
      });
      setUser(null);
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error("Error", {
        description: errorMessage,
      });
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        forgotPassword,
        resetPassword,
        validateResetToken,
        changePassword,
        logout,
        logoutAllDevices,
        deleteAccount,
        isAuthenticated,
        loading,
        refreshUser,
      }}
    >
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
