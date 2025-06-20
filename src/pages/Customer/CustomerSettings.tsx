import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
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

  const handleLogoutDevices = async () => {
    setActionStates(prev => ({ ...prev, logout: 'processing' }));
    try {
      await axios.post<ApiResponse>(
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
          transition-all duration-500 ease-out transform
          backdrop-blur-xl border-2
          hover:scale-[1.02] active:scale-[0.98]
          ${
            destructive
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
              : state === 'error'
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

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent
            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
        </div>
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 transition-all duration-500 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-radial from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-violet-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
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
          <Card className="relative overflow-hidden backdrop-blur-xl bg-slate-800/40 border-2 border-slate-700/60
            shadow-2xl rounded-3xl transition-all duration-500 hover:shadow-slate-500/30
            hover:border-slate-600/80 hover:bg-slate-800/60 group">

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
              {/* Toggle Password Change Fields */}
              <ActionButton
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                icon={showPasswordFields ? EyeOff : Lock}
                state={'idle'}
                aria-label="Toggle Change Password Fields"
              >
                {showPasswordFields ? 'Hide Password Fields' : 'Change Password'}
              </ActionButton>

              {showPasswordFields && (
                <div className="space-y-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600/50 animate-fadeIn">
                  <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <h4 className="text-blue-300 font-medium mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-blue-200 space-y-1">
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
                      className="w-full p-3 pr-10 rounded-md bg-slate-800/60 border border-slate-600 text-slate-50
                        placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={actionStates.password === 'processing'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
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
                      className="w-full p-3 pr-10 rounded-md bg-slate-800/60 border border-slate-600 text-slate-50
                        placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={actionStates.password === 'processing'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
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
                      className="w-full p-3 pr-10 rounded-md bg-slate-800/60 border border-slate-600 text-slate-50
                        placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={actionStates.password === 'processing'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
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
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .bg-300% {
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