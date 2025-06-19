import React, { useState } from 'react';
import axios from 'axios'; // Import axios for API calls
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner'; // Assuming sonner for toast notifications
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth context

import {
  Edit,
  User,
  Package,
  ShieldAlert,
  Download,
  Trash2,
  Shield,
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  CreditCard,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Loader2 // Added Loader2 for consistent loading feedback
} from 'lucide-react';

// Define a basic API response interface for consistency
interface ApiResponse {
  success?: boolean;
  message?: string;
}

const CustomerSettings = () => {
  const { user, logout } = useAuth(); // Destructure user and logout from useAuth
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  // Helper function for Button states
  type ButtonState = 'idle' | 'processing' | 'success' | 'error';

  const [actionStates, setActionStates] = useState<{
    password: ButtonState;
    download: ButtonState;
    logout: ButtonState;
    deleteAccount: ButtonState;
  }>({
    password: 'idle',
    download: 'idle',
    logout: 'idle',
    deleteAccount: 'idle' // Added state for delete account
  });

  const handlePasswordChange = async () => {
    setActionStates(prev => ({ ...prev, password: 'processing' }));
    try {
      // For security, changing password typically involves a form with old and new passwords.
      // This endpoint often sends a password reset email if not done through a form.
      // Assuming backend sends a reset link to the authenticated user's email.
      await axios.post<ApiResponse>(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        { /* If a form, you'd send { currentPassword, newPassword } here */ },
        { withCredentials: true }
      );

      setActionStates(prev => ({ ...prev, password: 'success' }));
      toast.success('Password change request sent!', {
        description: 'Check your email for instructions to update your password.',
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to initiate password change:', error);
      setActionStates(prev => ({ ...prev, password: 'error' }));
      toast.error('Failed to initiate password change.', {
        description: 'Please try again later or contact support.',
        duration: 5000,
      });
    } finally {
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, password: 'idle' }));
      }, 3000); // Reset state after a short delay
    }
  };

  const handleDownloadHistory = async () => {
    setIsDownloading(true);
    setActionStates(prev => ({ ...prev, download: 'processing' }));

    toast.info('Preparing your order history...', {
      description: 'Gathering data for download.',
    });

    try {
      // Backend endpoint to generate and provide a download for order history
      // This might return a file directly or a URL to download from.
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/profile/order-history`, // Changed to the specified endpoint
        {
          withCredentials: true,
          responseType: 'blob', // Important for downloading files
        }
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response.data as BlobPart], { type: response.headers['content-type'] });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `OrderHistory_${user?.name || 'customer'}_${new Date().getFullYear()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setActionStates(prev => ({ ...prev, download: 'success' }));
      toast.success('Order history downloaded successfully!', {
        description: 'Your order history has been saved to your downloads.',
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to download order history:', error);
      setActionStates(prev => ({ ...prev, download: 'error' }));
      toast.error('Failed to download order history.', {
        description: 'Please ensure you have orders or try again later.',
        duration: 5000,
      });
    } finally {
      setIsDownloading(false);
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, download: 'idle' }));
      }, 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      toast.warning('Confirm account deletion.', {
        description: 'This action cannot be undone. Click again to confirm permanent deletion.',
        duration: 6000,
      });
      return; // Exit and wait for the second click
    }

    setActionStates(prev => ({ ...prev, deleteAccount: 'processing' }));
    try {
      await axios.delete<ApiResponse>(
        `${import.meta.env.VITE_API_URL}/auth/delete-account`,
        { withCredentials: true }
      );

      setActionStates(prev => ({ ...prev, deleteAccount: 'success' }));
      toast.success('Account deletion initiated!', {
        description: 'Your account will be permanently deleted. You may receive a final confirmation email.',
        duration: 6000,
      });
      // After successful deletion, log out the user from the frontend
      logout(); // Call logout from AuthContext
    } catch (error) {
      console.error('Failed to delete account:', error);
      setActionStates(prev => ({ ...prev, deleteAccount: 'error' }));
      toast.error('Failed to delete account.', {
        description: 'Please try again or contact support if the issue persists.',
        duration: 5000,
      });
    } finally {
      setShowDeleteConfirm(false); // Reset confirmation state
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, deleteAccount: 'idle' }));
      }, 3000);
    }
  };

  const handleLogoutDevices = async () => {
    setActionStates(prev => ({ ...prev, logout: 'processing' }));
    try {
      await axios.post<ApiResponse>(
        `${import.meta.env.VITE_API_URL}/auth/logout-all`,
        {}, // No body typically needed for this endpoint
        { withCredentials: true }
      );

      setActionStates(prev => ({ ...prev, logout: 'success' }));
      toast.success('Successfully logged out from all devices!', {
        description: 'All active sessions have been terminated for security.',
        duration: 5000,
      });
      // Optionally, after logging out from all devices, you might want to
      // refresh the current session or redirect to login.
      logout(); // Forcing a local logout as well
    } catch (error) {
      console.error('Failed to log out from all devices:', error);
      setActionStates(prev => ({ ...prev, logout: 'error' }));
      toast.error('Failed to log out from all devices.', {
        description: 'Please try again later.',
        duration: 5000,
      });
    } finally {
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, logout: 'idle' }));
      }, 3000);
    }
  };

  // Type for Button variant props
  type ButtonVariant = "outline" | "destructive" | "link" | "default" | "secondary" | "ghost" | null | undefined;

  const ActionButton = ({
    onClick,
    variant = "outline",
    icon: Icon,
    children,
    destructive = false,
    state = 'idle' // Use ButtonState type
  }: {
    onClick: () => void;
    variant?: ButtonVariant;
    icon: React.ElementType;
    children: React.ReactNode;
    destructive?: boolean;
    state?: ButtonState; // Use ButtonState type
  }) => {
    const getStateIcon = () => {
      if (state === 'processing') return Clock;
      if (state === 'success') return CheckCircle;
      if (state === 'error') return AlertTriangle; // Add an icon for error state
      return Icon;
    };

    const StateIcon = getStateIcon();

    return (
      <Button
        onClick={onClick}
        variant={destructive ? "destructive" : variant}
        className={`
          group relative overflow-hidden w-full justify-between p-6 h-auto
          transition-all duration-500 ease-out transform
          backdrop-blur-xl border-2
          hover:scale-[1.02] active:scale-[0.98]
          ${destructive
            ? `
              bg-gradient-to-br from-red-500/20 via-red-600/10 to-red-700/20
              hover:from-red-500/30 hover:via-red-600/20 hover:to-red-700/30
              border-red-400/50 hover:border-red-400/80
              hover:shadow-2xl hover:shadow-red-500/40
              text-red-50 hover:text-white
              before:absolute before:inset-0 before:bg-gradient-to-r
              before:from-red-600/0 before:via-red-500/20 before:to-red-600/0
              before:translate-x-[-100%] hover:before:translate-x-[100%]
              before:transition-transform before:duration-700
            `
            : state === 'success'
            ? `
              bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-teal-500/20
              border-emerald-400/60 text-emerald-50
              hover:from-emerald-500/30 hover:via-green-500/20 hover:to-teal-500/30
              hover:border-emerald-400/80 hover:shadow-2xl hover:shadow-emerald-500/40
              before:absolute before:inset-0 before:bg-gradient-to-r
              before:from-emerald-600/0 before:via-emerald-400/30 before:to-emerald-600/0
              before:translate-x-[-100%] hover:before:translate-x-[100%]
              before:transition-transform before:duration-700
            `
            : state === 'error' // Added error state styling
            ? `
              bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-orange-700/20
              border-orange-400/50 text-orange-50
              hover:from-orange-500/30 hover:via-orange-600/20 hover:to-orange-700/30
              hover:border-orange-400/80 hover:shadow-2xl hover:shadow-orange-500/40
              before:absolute before:inset-0 before:bg-gradient-to-r
              before:from-orange-600/0 before:via-orange-500/20 before:to-orange-600/0
              before:translate-x-[-100%] hover:before:translate-x-[100%]
              before:transition-transform before:duration-700
            `
            : `
              bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-900/60
              border-slate-600/60 hover:border-slate-500/80
              text-slate-50 hover:text-white
              hover:from-slate-700/70 hover:via-slate-600/50 hover:to-slate-800/70
              hover:shadow-2xl hover:shadow-slate-500/30
              before:absolute before:inset-0 before:bg-gradient-to-r
              before:from-slate-600/0 before:via-slate-400/20 before:to-slate-600/0
              before:translate-x-[-100%] hover:before:translate-x-[100%]
              before:transition-transform before:duration-700
            `
          }
          ${state === 'processing' ? 'animate-pulse shadow-lg' : ''}
        `}
        disabled={state === 'processing'}
        aria-label={typeof children === 'string' ? children : 'Button'}
        role="button"
      >
        <div className="flex items-center relative z-10">
          {state === 'processing' ? (
            <div className="relative">
              <Loader2 className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-current border-t-transparent text-slate-300" />
              <div className="absolute inset-0 w-5 h-5 mr-3 animate-ping rounded-full border border-current opacity-30 text-slate-300" />
            </div>
          ) : (
            <div className="relative">
              <StateIcon className={`w-5 h-5 mr-3 transition-all duration-300 ${
                state === 'success'
                  ? 'text-emerald-300 animate-bounce'
                  : state === 'error'
                  ? 'text-orange-300 drop-shadow-lg'
                  : destructive
                  ? 'text-red-300 drop-shadow-lg'
                  : 'text-slate-300 drop-shadow-lg group-hover:text-white'
              }`} />
              {state === 'success' && (
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-emerald-400 animate-pulse" />
              )}
            </div>
          )}
          <span className="font-medium text-base leading-relaxed relative z-10">{children}</span>
        </div>

        <div className="relative z-10">
          <ArrowRight className={`w-5 h-5 transition-all duration-500 ${
            state === 'success'
              ? 'text-emerald-300 rotate-0 scale-110'
              : state === 'error'
              ? 'text-orange-300 rotate-0 scale-110'
              : destructive
              ? 'text-red-300 group-hover:translate-x-2 group-hover:scale-110'
              : 'text-slate-300 group-hover:translate-x-2 group-hover:scale-110 group-hover:text-white'
          }`} />
        </div>

        {/* Animated background effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent
                         translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
        </div>
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 transition-all duration-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-radial from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-violet-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-3xl shadow-2xl
                           flex items-center justify-center transform hover:scale-110 transition-all duration-500
                           hover:shadow-slate-500/40 relative overflow-hidden group border-2 border-slate-600/50">
              <Settings className="w-12 h-12 text-slate-200 group-hover:text-white transition-all duration-300 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0
                             group-hover:opacity-100 transition-opacity duration-500" />
              <Zap className="absolute top-2 right-2 w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100
                             animate-ping transition-opacity duration-300" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4 relative">
            <span className="bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent
                           drop-shadow-2xl animate-gradient bg-300% leading-tight">
              Account Settings
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20
                           bg-clip-text text-transparent blur-sm -z-10">
              Account Settings
            </div>
          </h1>

          <p className="text-slate-300 text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Manage your account preferences and security settings with
            <span className="text-emerald-400 font-medium"> enhanced controls</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          {/* Account Actions */}
          <Card className="relative overflow-hidden backdrop-blur-xl bg-slate-800/40 border-2 border-slate-700/60
                          shadow-2xl rounded-3xl transition-all duration-500 hover:shadow-slate-500/30
                          hover:border-slate-600/80 hover:bg-slate-800/60 group">

            {/* Card background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 via-transparent to-slate-900/20 opacity-0
                           group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                           opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-6 relative z-10">
              <CardTitle className="text-slate-100 flex items-center text-2xl font-bold">
                <div className="relative">
                  <Lock className="w-7 h-7 mr-4 text-slate-400 transition-all duration-300 group-hover:text-emerald-400" />
                  <div className="absolute inset-0 w-7 h-7 mr-4 bg-emerald-400/20 rounded-full blur-lg opacity-0
                                 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                Account Security & Data
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg font-light leading-relaxed mt-2">
                Secure your account and manage your personal information with
                <span className="text-blue-400 font-medium"> advanced controls</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10 pb-8">
              <ActionButton
                onClick={handlePasswordChange}
                icon={Edit}
                state={actionStates.password}
                aria-label="Change Password"
              >
                {actionStates.password === 'processing' ? 'Initiating Password Change...' :
                 actionStates.password === 'success' ? 'Password Change Initiated ✓' :
                 actionStates.password === 'error' ? 'Password Change Failed ✗' : // Added error message
                 'Change Password'}
              </ActionButton>

              <ActionButton
                onClick={handleDownloadHistory}
                icon={isDownloading ? Download : Package}
                state={actionStates.download}
                aria-label="Download Order History"
              >
                {actionStates.download === 'processing' ? 'Preparing Complete History...' :
                 actionStates.download === 'success' ? 'Order History Downloaded ✓' :
                 actionStates.download === 'error' ? 'Download Failed ✗' : // Added error message
                 'Download Complete Order History'}
              </ActionButton>

              <ActionButton
                onClick={handleLogoutDevices}
                icon={ShieldAlert}
                state={actionStates.logout}
                aria-label="Logout from All Devices"
              >
                {actionStates.logout === 'processing' ? 'Terminating All Sessions...' :
                 actionStates.logout === 'success' ? 'All Devices Logged Out ✓' :
                 actionStates.logout === 'error' ? 'Logout Failed ✗' : // Added error message
                 'Logout from All Devices'}
              </ActionButton>

              {showDeleteConfirm && (
                <div className="relative overflow-hidden p-6 bg-gradient-to-br from-red-950/80 via-red-900/60 to-red-950/80
                               border-2 border-red-700/60 rounded-2xl shadow-2xl animate-fadeIn backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-500/20 to-red-600/10" />
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="relative">
                        <AlertTriangle className="w-7 h-7 text-red-400 mr-4 animate-bounce" />
                        <div className="absolute inset-0 w-7 h-7 bg-red-400/30 rounded-full blur-lg animate-pulse" />
                      </div>
                      <span className="text-red-100 font-bold text-xl">
                        ⚠️ CRITICAL ACTION REQUIRED
                      </span>
                    </div>
                    <p className="text-red-200 mb-5 font-medium text-lg leading-relaxed">
                      This action is <strong className="text-red-100">irreversible</strong>. All your data, order history,
                      saved preferences, and account information will be permanently deleted.
                    </p>
                    <div className="bg-gradient-to-r from-red-800/50 to-red-900/50 p-4 rounded-xl border border-red-600/30 backdrop-blur-sm">
                      <p className="text-red-100 text-base font-medium">
                        🔒 Once confirmed, you will have 24 hours to cancel this request via email.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <ActionButton
                onClick={handleDeleteAccount}
                icon={showDeleteConfirm ? AlertTriangle : Trash2}
                destructive={true}
                state={actionStates.deleteAccount} // Use the new state
                aria-label="Delete Account"
              >
                {showDeleteConfirm ? '🗑️ PERMANENTLY DELETE MY ACCOUNT' :
                 actionStates.deleteAccount === 'processing' ? 'Initiating Deletion...' :
                 actionStates.deleteAccount === 'success' ? 'Deletion Initiated ✓' :
                 actionStates.deleteAccount === 'error' ? 'Deletion Failed ✗' : // Added error message
                 'Delete Account'}
              </ActionButton>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .bg-300\\% {
          background-size: 300% 300%;
        }
        .bg-gradient-radial {
          background-image: radial-gradient(var(--tw-gradient-stops));
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CustomerSettings;