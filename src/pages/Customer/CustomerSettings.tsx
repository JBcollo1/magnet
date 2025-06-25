import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Loader2
} from 'lucide-react';

// Mock axios for demo
const axios = {
  get: async (url: string, options?: any) => {
    // Mock response for demo
    return Promise.resolve({
      data: new Blob(['Mock PDF content'], { type: 'application/pdf' }),
      headers: { 'content-type': 'application/pdf' }
    });
  },
  delete: async (url: string, options?: any) => {
    return Promise.resolve({ data: { success: true } });
  },
  post: async (url: string, data?: any, options?: any) => {
    return Promise.resolve({ data: { success: true } });
  }
};

// Mock toast for demo
const toast = {
  error: (message: string) => console.log('Error:', message),
  success: (message: string) => console.log('Success:', message),
  warning: (message: string, options?: any) => console.log('Warning:', message),
  info: (message: string, options?: any) => console.log('Info:', message)
};

// Mock auth context for demo
const useAuth = () => ({
  user: { name: 'Demo User' },
  logout: () => console.log('Logout'),
  changePassword: async (current: string, newPass: string) => {
    // Mock password change
    if (current === 'wrong') {
      throw new Error('Invalid current password');
    }
    return Promise.resolve();
  }
});

interface ApiResponse {
  success?: boolean;
  message?: string;
}

const CustomerSettings = () => {
  const { user, logout, changePassword } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // State for password change form inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // State for individual password input visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

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
    deleteAccount: 'idle'
  });

  // Password validation helper
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handlePasswordChange = async () => {
    setActionStates(prev => ({ ...prev, password: 'processing' }));

    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('All password fields are required.');
      setActionStates(prev => ({ ...prev, password: 'error' }));
      setTimeout(() => setActionStates(prev => ({ ...prev, password: 'idle' })), 3000);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New password and confirmation do not match.');
      setActionStates(prev => ({ ...prev, password: 'error' }));
      setTimeout(() => setActionStates(prev => ({ ...prev, password: 'idle' })), 3000);
      return;
    }

    // Validate new password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      setActionStates(prev => ({ ...prev, password: 'error' }));
      setTimeout(() => setActionStates(prev => ({ ...prev, password: 'idle' })), 3000);
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password.');
      setActionStates(prev => ({ ...prev, password: 'error' }));
      setTimeout(() => setActionStates(prev => ({ ...prev, password: 'idle' })), 3000);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);

      setActionStates(prev => ({ ...prev, password: 'success' }));
      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordFields(false);
      // Reset password visibility toggles
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
    } catch (error) {
      console.error('Failed to change password:', error);
      setActionStates(prev => ({ ...prev, password: 'error' }));
      // The error toast is already handled in the AuthContext
    } finally {
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, password: 'idle' }));
      }, 3000);
    }
  };

  const handleDownloadHistory = async () => {
    setIsDownloading(true);
    setActionStates(prev => ({ ...prev, download: 'processing' }));

    toast.info('Preparing your order history...', {
      description: 'Gathering data for download.',
    });

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/profile/order-history`,
        {
          withCredentials: true,
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data as BlobPart], { type: response.headers['content-type'] });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `OrderHistory_${user?.name || 'customer'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setActionStates(prev => ({ ...prev, download: 'success' }));
      toast.success('Order history downloaded successfully!');
    } catch (error) {
      console.error('Failed to download order history:', error);
      setActionStates(prev => ({ ...prev, download: 'error' }));
      toast.error('Failed to download order history.');
    } finally {
      setIsDownloading(false);
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, download: 'idle' }));
      }, 3000);
    }
  };

  const handleLogoutDevices = async () => {
    setActionStates(prev => ({ ...prev, logout: 'processing' }));
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout-all`,
        {},
        { withCredentials: true }
      );

      setActionStates(prev => ({ ...prev, logout: 'success' }));
      toast.success('Successfully logged out from all devices!');
      logout();
    } catch (error) {
      console.error('Failed to log out from all devices:', error);
      setActionStates(prev => ({ ...prev, logout: 'error' }));
      toast.error('Failed to log out from all devices.');
    } finally {
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, logout: 'idle' }));
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
      return;
    }

    setActionStates(prev => ({ ...prev, deleteAccount: 'processing' }));

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/auth/delete-account`,
        { withCredentials: true }
      );

      setActionStates(prev => ({ ...prev, deleteAccount: 'success' }));
      toast.success('Account deletion initiated!');
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      setActionStates(prev => ({ ...prev, deleteAccount: 'error' }));
      toast.error('Failed to delete account.');
    } finally {
      setShowDeleteConfirm(false);
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, deleteAccount: 'idle' }));
      }, 3000);
    }
  };

  type ButtonVariant = "outline" | "destructive" | "link" | "default" | "secondary" | "ghost" | null | undefined;

  const ActionButton = ({
    onClick,
    variant = "outline",
    icon: Icon,
    children,
    destructive = false,
    state = 'idle'
  }: {
    onClick: () => void;
    variant?: ButtonVariant;
    icon: React.ElementType;
    children: React.ReactNode;
    destructive?: boolean;
    state?: ButtonState;
  }) => {
    const getStateIcon = () => {
      if (state === 'processing') return Loader2;
      if (state === 'success') return CheckCircle;
      if (state === 'error') return AlertTriangle;
      return Icon;
    };

    const StateIcon = getStateIcon();

    return (
      <Button
        onClick={onClick}
        variant={destructive ? "destructive" : variant}
        className={`
          group relative overflow-hidden w-full justify-between p-6 h-auto
          transition-all duration-300 ease-out transform
          backdrop-blur-xl border-2 hover:scale-[1.02] active:scale-[0.98]
          ${
            destructive
              ? `
                bg-red-900/50 hover:bg-red-800/60 dark:bg-red-900/50 dark:hover:bg-red-800/60
                border-red-600/50 hover:border-red-500/80 dark:border-red-600/50 dark:hover:border-red-500/80
                text-red-100 hover:text-white dark:text-red-100 dark:hover:text-white
                hover:shadow-xl hover:shadow-red-500/20 dark:hover:shadow-xl dark:hover:shadow-red-500/20
                bg-red-100/50 hover:bg-red-200/60 border-red-300/50 hover:border-red-400/80 text-red-800 hover:text-red-900 shadow-lg shadow-red-200/50
              `
              : state === 'success'
              ? `
                bg-emerald-900/50 hover:bg-emerald-800/60 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60
                border-emerald-500/50 hover:border-emerald-400/80 dark:border-emerald-500/50 dark:hover:border-emerald-400/80
                text-emerald-100 hover:text-white dark:text-emerald-100 dark:hover:text-white
                hover:shadow-xl hover:shadow-emerald-500/20 dark:hover:shadow-xl dark:hover:shadow-emerald-500/20
                bg-emerald-100/50 hover:bg-emerald-200/60 border-emerald-300/50 hover:border-emerald-400/80 text-emerald-800 hover:text-emerald-900 shadow-lg shadow-emerald-200/50
              `
              : state === 'error'
              ? `
                bg-orange-900/50 hover:bg-orange-800/60 dark:bg-orange-900/50 dark:hover:bg-orange-800/60
                border-orange-500/50 hover:border-orange-400/80 dark:border-orange-500/50 dark:hover:border-orange-400/80
                text-orange-100 hover:text-white dark:text-orange-100 dark:hover:text-white
                hover:shadow-xl hover:shadow-orange-500/20 dark:hover:shadow-xl dark:hover:shadow-orange-500/20
                bg-orange-100/50 hover:bg-orange-200/60 border-orange-300/50 hover:border-orange-400/80 text-orange-800 hover:text-orange-900 shadow-lg shadow-orange-200/50
              `
              : `
                bg-[#2D2D2D] hover:bg-[#1A1A1A] dark:bg-[#2D2D2D] dark:hover:bg-[#1A1A1A]
                border-[#303030] hover:border-[#00C896]/50 dark:border-[#303030] dark:hover:border-[#00C896]/50
                text-[#E0E0E0] hover:text-white dark:text-[#E0E0E0] dark:hover:text-white
                hover:shadow-xl hover:shadow-gray-500/20 dark:hover:shadow-xl dark:hover:shadow-gray-500/20
                bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-gray-400 text-gray-800 hover:text-gray-900 shadow-lg shadow-gray-200/50
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
              <Loader2 className="w-5 h-5 mr-3 animate-spin text-[#00C896] dark:text-[#00C896] text-gray-600" />
            </div>
          ) : (
            <div className="relative">
              <StateIcon className={`w-5 h-5 mr-3 transition-all duration-300 ${
                state === 'success'
                  ? 'text-emerald-400 dark:text-emerald-400 text-emerald-600'
                  : state === 'error'
                  ? 'text-orange-400 dark:text-orange-400 text-orange-600'
                  : destructive
                  ? 'text-red-400 dark:text-red-400 text-red-600'
                  : 'text-[#00C896] group-hover:text-white dark:text-[#00C896] dark:group-hover:text-white text-gray-600 group-hover:text-gray-800'
              }`} />
              {state === 'success' && (
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-emerald-400 dark:text-emerald-400 text-emerald-600 animate-pulse" />
              )}
            </div>
          )}
          <span className="font-medium text-base leading-relaxed relative z-10">{children}</span>
        </div>

        <div className="relative z-10">
          <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
            state === 'success'
              ? 'text-emerald-400 dark:text-emerald-400 text-emerald-600'
              : state === 'error'
              ? 'text-orange-400 dark:text-orange-400 text-orange-600'
              : destructive
              ? 'text-red-400 group-hover:translate-x-2 dark:text-red-400 dark:group-hover:translate-x-2 text-red-600 group-hover:translate-x-2'
              : 'text-[#00C896] group-hover:translate-x-2 group-hover:text-white dark:text-[#00C896] dark:group-hover:translate-x-2 dark:group-hover:text-white text-gray-600 group-hover:translate-x-2 group-hover:text-gray-800'
          }`} />
        </div>
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] dark:bg-[#121212] bg-white p-6 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-[#2D2D2D] dark:bg-[#2D2D2D] bg-gray-100 rounded-3xl shadow-2xl
              flex items-center justify-center transform hover:scale-110 transition-all duration-300
              border-2 border-[#303030] hover:border-[#00C896]/50 dark:border-[#303030] dark:hover:border-[#00C896]/50
              border-gray-200 hover:border-gray-400 group">
              <Settings className="w-12 h-12 text-[#00C896] group-hover:text-white dark:text-[#00C896] dark:group-hover:text-white text-gray-700 group-hover:text-gray-900 transition-all duration-300" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4 text-[#E0E0E0] dark:text-[#E0E0E0] text-gray-900">
            Account Settings
          </h1>

          <p className="text-gray-400 dark:text-gray-400 text-gray-600 text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Manage your account preferences and security settings with
            <span className="text-[#00C896] dark:text-[#00C896] text-emerald-600 font-medium"> enhanced controls</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          <Card className="relative overflow-hidden bg-[#2D2D2D] border-2 border-[#303030]
            shadow-2xl rounded-3xl transition-all duration-300 hover:shadow-xl
            hover:border-[#00C896]/50 group
            dark:bg-[#2D2D2D] dark:border-[#303030] dark:hover:border-[#00C896]/50
            bg-white border-gray-200 hover:border-gray-400 shadow-md">

            <CardHeader className="pb-6">
              <CardTitle className="text-[#E0E0E0] flex items-center text-2xl font-bold
                dark:text-[#E0E0E0] text-gray-900">
                <Lock className="w-7 h-7 mr-4 text-[#00C896] group-hover:text-white transition-all duration-300
                  dark:text-[#00C896] dark:group-hover:text-white text-gray-700 group-hover:text-gray-900" />
                Account Security & Data
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg font-light leading-relaxed mt-2
                dark:text-gray-400 text-gray-600">
                Secure your account and manage your personal information with
                <span className="text-[#00C896] font-medium dark:text-[#00C896] text-emerald-600"> advanced controls</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pb-8">
              <ActionButton
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                icon={showPasswordFields ? EyeOff : Lock}
                state={'idle'}
                aria-label="Toggle Change Password Fields"
              >
                {showPasswordFields ? 'Hide Password Fields' : 'Change Password'}
              </ActionButton>

              {showPasswordFields && (
                <div className="space-y-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#303030] animate-fadeIn
                  dark:bg-[#1A1A1A] dark:border-[#303030]
                  bg-gray-50 border-gray-200">
                  <div className="mb-4 p-3 bg-[#00C896]/10 border border-[#00C896]/30 rounded-lg
                    dark:bg-[#00C896]/10 dark:border-[#00C896]/30
                    bg-emerald-50 border-emerald-200">
                    <h4 className="text-[#00C896] font-medium mb-2 dark:text-[#00C896] text-emerald-700">Password Requirements:</h4>
                    <ul className="text-sm text-gray-300 space-y-1 dark:text-gray-300 text-gray-700">
                      <li>• At least 8 characters long</li>
                      <li>• Contains uppercase and lowercase letters</li>
                      <li>• Contains at least one number</li>
                      <li>• Different from your current password</li>
                    </ul>
                  </div>

                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-3 pr-10 rounded-md bg-[#1A1A1A] border border-[#303030] text-[#E0E0E0]
                        placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00C896] focus:border-[#00C896]
                        hover:border-[#00C896]/50 transition-all duration-300
                        dark:bg-[#1A1A1A] dark:border-[#303030] dark:text-[#E0E0E0] dark:placeholder-gray-500 dark:focus:ring-[#00C896] dark:focus:border-[#00C896] dark:hover:border-[#00C896]/50
                        bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400"
                      disabled={actionStates.password === 'processing'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#00C896] transition-colors duration-300
                        dark:text-gray-400 dark:hover:text-[#00C896] text-gray-500 hover:text-emerald-600"
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      disabled={actionStates.password === 'processing'}
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 pr-10 rounded-md bg-[#1A1A1A] border border-[#303030] text-[#E0E0E0]
                        placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00C896] focus:border-[#00C896]
                        hover:border-[#00C896]/50 transition-all duration-300
                        dark:bg-[#1A1A1A] dark:border-[#303030] dark:text-[#E0E0E0] dark:placeholder-gray-500 dark:focus:ring-[#00C896] dark:focus:border-[#00C896] dark:hover:border-[#00C896]/50
                        bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400"
                      disabled={actionStates.password === 'processing'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#00C896] transition-colors duration-300
                        dark:text-gray-400 dark:hover:text-[#00C896] text-gray-500 hover:text-emerald-600"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      disabled={actionStates.password === 'processing'}
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      placeholder="Confirm New Password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full p-3 pr-10 rounded-md bg-[#1A1A1A] border border-[#303030] text-[#E0E0E0]
                        placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00C896] focus:border-[#00C896]
                        hover:border-[#00C896]/50 transition-all duration-300
                        dark:bg-[#1A1A1A] dark:border-[#303030] dark:text-[#E0E0E0] dark:placeholder-gray-500 dark:focus:ring-[#00C896] dark:focus:border-[#00C896] dark:hover:border-[#00C896]/50
                        bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400"
                      disabled={actionStates.password === 'processing'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#00C896] transition-colors duration-300
                        dark:text-gray-400 dark:hover:text-[#00C896] text-gray-500 hover:text-emerald-600"
                      aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                      disabled={actionStates.password === 'processing'}
                    >
                      {showConfirmNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <ActionButton
                    onClick={handlePasswordChange}
                    icon={Edit}
                    state={actionStates.password}
                    aria-label="Submit Password Change"
                  >
                    {actionStates.password === 'processing' ? 'Updating Password...' :
                      actionStates.password === 'success' ? 'Password Updated ✓' :
                        actionStates.password === 'error' ? 'Update Failed ✗' :
                          'Update Password'}
                  </ActionButton>
                </div>
              )}

              <ActionButton
                onClick={handleDownloadHistory}
                icon={isDownloading ? Download : Package}
                state={actionStates.download}
                aria-label="Download Order History"
              >
                {actionStates.download === 'processing' ? 'Preparing Complete History...' :
                  actionStates.download === 'success' ? 'Order History Downloaded ✓' :
                    actionStates.download === 'error' ? 'Download Failed ✗' :
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
                    actionStates.logout === 'error' ? 'Logout Failed ✗' :
                      'Logout from All Devices'}
              </ActionButton>

              {showDeleteConfirm && (
                <div className="relative overflow-hidden p-6 bg-red-950/80 border-2 border-red-700/60 rounded-2xl shadow-2xl animate-fadeIn
                  dark:bg-red-950/80 dark:border-red-700/60
                  bg-red-50 border-red-200">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-400 mr-4 animate-bounce
                      dark:text-red-400 text-red-600" />
                    <span className="text-red-100 font-bold text-xl dark:text-red-100 text-red-800">
                      ⚠️ CRITICAL ACTION REQUIRED
                    </span>
                  </div>
                  <p className="text-red-200 mb-5 font-medium text-lg leading-relaxed dark:text-red-200 text-red-700">
                    This action is <strong className="text-red-100 dark:text-red-100 text-red-900">irreversible</strong>. All your data, order history,
                    saved preferences, and account information will be permanently deleted.
                  </p>
                  <div className="bg-red-800/50 p-4 rounded-xl border border-red-600/30
                    dark:bg-red-800/50 dark:border-red-600/30
                    bg-red-100 border-red-300">
                    <p className="text-red-100 text-base font-medium dark:text-red-100 text-red-800">
                      🔒 Once confirmed, you will have 24 hours to cancel this request via email.
                    </p>
                  </div>
                </div>
              )}

              <ActionButton
                onClick={handleDeleteAccount}
                icon={showDeleteConfirm ? AlertTriangle : Trash2}
                destructive={true}
                state={actionStates.deleteAccount}
                aria-label="Delete Account"
              >
                {showDeleteConfirm ? '🗑️ PERMANENTLY DELETE MY ACCOUNT' :
                  actionStates.deleteAccount === 'processing' ? 'Initiating Deletion...' :
                    actionStates.deleteAccount === 'success' ? 'Deletion Initiated ✓' :
                      actionStates.deleteAccount === 'error' ? 'Deletion Failed ✗' :
                        'Delete Account'}
              </ActionButton>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
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