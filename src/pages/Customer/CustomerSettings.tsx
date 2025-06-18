import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
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
  ArrowRight
} from 'lucide-react';

const CustomerSettings = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [actionStates, setActionStates] = useState({
    password: 'idle',
    download: 'idle',
    logout: 'idle'
  });

  const handlePasswordChange = () => {
    setActionStates(prev => ({ ...prev, password: 'processing' }));

    setTimeout(() => {
      setActionStates(prev => ({ ...prev, password: 'success' }));
      toast.success('Password update initiated!', {
        description: 'Check your email for the secure password reset link.',
        duration: 4000,
      });

      setTimeout(() => {
        setActionStates(prev => ({ ...prev, password: 'idle' }));
      }, 3000);
    }, 1500);
  };

  const handleDownloadHistory = async () => {
    setIsDownloading(true);
    setActionStates(prev => ({ ...prev, download: 'processing' }));

    toast.info('Preparing your order history...', {
      description: 'Gathering data from the last 2 years...',
    });

    setTimeout(() => {
      toast.info('Almost ready...', {
        description: 'Compressing files and ensuring data integrity.',
      });
    }, 1000);

    setTimeout(() => {
      setIsDownloading(false);
      setActionStates(prev => ({ ...prev, download: 'success' }));
      toast.success('Order history downloaded successfully!', {
        description: 'OrderHistory_2023-2025.zip saved to your downloads folder.',
        duration: 5000,
      });

      setTimeout(() => {
        setActionStates(prev => ({ ...prev, download: 'idle' }));
      }, 3000);
    }, 2500);
  };

  const handleDeleteAccount = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      toast.error('Account deletion requires confirmation.', {
        description: 'This action cannot be undone. Please confirm below.',
        duration: 6000,
      });
    } else {
      toast.error('Account deletion process initiated.', {
        description: 'You will receive a confirmation email within 5 minutes.',
        duration: 6000,
      });
      setShowDeleteConfirm(false);
    }
  };

  const handleLogoutDevices = () => {
    setActionStates(prev => ({ ...prev, logout: 'processing' }));

    setTimeout(() => {
      setActionStates(prev => ({ ...prev, logout: 'success' }));
      toast('Successfully logged out from all devices!', {
        description: 'Found 4 active sessions. All have been terminated for security.',
        duration: 5000,
      });

      setTimeout(() => {
        setActionStates(prev => ({ ...prev, logout: 'idle' }));
      }, 3000);
    }, 1200);
  };

  type ButtonVariant = "outline" | "destructive" | "link" | "default" | "secondary" | "ghost" | null | undefined;

  const ActionButton = ({
    onClick,
    variant = "outline",
    icon: Icon,
    children,
    loading = false,
    destructive = false,
    state = 'idle'
  }: {
    onClick: () => void;
    variant?: ButtonVariant;
    icon: React.ElementType;
    children: React.ReactNode;
    loading?: boolean;
    destructive?: boolean;
    state?: string;
  }) => {
    const getStateIcon = () => {
      if (state === 'processing') return Clock;
      if (state === 'success') return CheckCircle;
      return Icon;
    };

    const StateIcon = getStateIcon();

    return (
      <Button
        onClick={onClick}
        variant={destructive ? "destructive" : variant}
        className={`w-full justify-between group transition-all duration-300 transform hover:scale-[1.02] ${
          destructive
            ? 'hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/30 active:scale-95'
            : state === 'success'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 active:scale-95'
        } ${state === 'processing' ? 'animate-pulse' : ''}`}
        disabled={loading || state === 'processing'}
        aria-label={typeof children === 'string' ? children : 'Button'}
        role="button"
      >
        <div className="flex items-center">
          {loading || state === 'processing' ? (
            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <StateIcon className={`w-4 h-4 mr-2 transition-all duration-300 ${
              state === 'success' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
            }`} />
          )}
          <span className="text-gray-900 dark:text-gray-100">{children}</span>
        </div>
        <ArrowRight className={`w-4 h-4 transform transition-all duration-300 ${
          state === 'success'
            ? 'text-green-600 dark:text-green-400 rotate-0'
            : 'rotate-0 group-hover:translate-x-1 group-hover:scale-110 text-gray-900 dark:text-gray-100'
        }`} />
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6 transition-all duration-500">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-full mb-4 shadow-2xl transform hover:scale-110 transition-all duration-300 hover:shadow-gray-500/30">
            <Settings className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage your account preferences and security settings with enhanced controls
          </p>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          {/* Account Actions */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl transition-all duration-300 hover:shadow-3xl hover:border-gray-300 dark:hover:border-gray-600">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center text-xl">
                <Lock className="w-6 h-6 mr-3 text-gray-600 animate-pulse" />
                Account Security & Data
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                Secure your account and manage your personal information with advanced controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActionButton
                onClick={handlePasswordChange}
                icon={Edit}
                state={actionStates.password}
                aria-label="Change Password"
              >
                {actionStates.password === 'processing' ? 'Initiating Password Change...' :
                 actionStates.password === 'success' ? 'Password Change Initiated ✓' :
                 'Change Password'}
              </ActionButton>

              <ActionButton
                onClick={handleDownloadHistory}
                icon={isDownloading ? Download : Package}
                loading={isDownloading}
                state={actionStates.download}
                aria-label="Download Order History"
              >
                {isDownloading ? 'Preparing Complete History...' :
                 actionStates.download === 'success' ? 'Order History Downloaded ✓' :
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
                 'Logout from All Devices'}
              </ActionButton>

              {showDeleteConfirm && (
                <div className="p-5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-300 dark:border-red-700 rounded-xl shadow-lg animate-fadeIn">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 mr-3 animate-bounce" />
                    <span className="text-red-800 dark:text-red-200 font-bold text-lg">
                      ⚠️ CRITICAL ACTION REQUIRED
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 mb-4 font-medium">
                    This action is <strong>irreversible</strong>. All your data, order history,
                    saved preferences, and account information will be permanently deleted.
                  </p>
                  <div className="bg-red-200 dark:bg-red-800/50 p-3 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                      🔒 Once confirmed, you will have 24 hours to cancel this request via email.
                    </p>
                  </div>
                </div>
              )}

              <ActionButton
                onClick={handleDeleteAccount}
                icon={showDeleteConfirm ? AlertTriangle : Trash2}
                destructive={true}
                aria-label="Delete Account"
              >
                {showDeleteConfirm ? '🗑️ PERMANENTLY DELETE MY ACCOUNT' : 'Delete Account'}
              </ActionButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;