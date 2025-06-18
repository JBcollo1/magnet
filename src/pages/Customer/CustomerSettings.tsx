import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Edit,
  Package,
  ShieldAlert,
  Download,
  Trash2,
  Settings,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

const CustomerSettings = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [actionStates, setActionStates] = useState({
    password: 'idle',
    download: 'idle',
    logout: 'idle',
  });

  const handleAction = (key: keyof typeof actionStates, successMsg: string, delay = 1500) => {
    setActionStates(prev => ({ ...prev, [key]: 'processing' }));

    setTimeout(() => {
      setActionStates(prev => ({ ...prev, [key]: 'success' }));
      toast.success(successMsg);

      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [key]: 'idle' }));
      }, 3000);
    }, delay);
  };

  const handlePasswordChange = () => {
    handleAction('password', 'Password update initiated! Check your email.');
  };

  const handleDownloadHistory = async () => {
    setIsDownloading(true);
    handleAction('download', 'Order history downloaded successfully!', 2500);

    toast.info('Preparing your order history...', {
      description: 'Gathering data from the last 2 years...',
    });

    setTimeout(() => {
      toast.info('Almost ready...', {
        description: 'Compressing files and ensuring data integrity.',
      });
    }, 1000);

    setTimeout(() => setIsDownloading(false), 2500);
  };

  const handleLogoutDevices = () => {
    handleAction('logout', 'Logged out from all devices.');
  };

  const handleDeleteAccount = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      toast.error('Account deletion requires confirmation.', {
        description: 'This action cannot be undone.',
      });
    } else {
      toast.error('Account deletion initiated. Confirmation email sent.');
      setShowDeleteConfirm(false);
    }
  };

  const ActionButton = ({
    onClick,
    icon: Icon,
    children,
    variant = 'outline',
    state = 'idle',
    loading = false,
    destructive = false,
  }: {
    onClick: () => void;
    icon: React.ElementType;
    children: React.ReactNode;
    variant?: any;
    state?: string;
    loading?: boolean;
    destructive?: boolean;
  }) => {
    const IconToShow = state === 'processing' ? Clock : state === 'success' ? CheckCircle : Icon;

    return (
      <Button
        onClick={onClick}
        variant={destructive ? 'destructive' : variant}
        disabled={loading || state === 'processing'}
        className={`w-full justify-between group transition-all duration-300 transform hover:scale-[1.02] ${
          destructive
            ? 'hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/30'
            : state === 'success'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
            : 'hover:bg-muted hover:shadow-lg'
        } ${state === 'processing' ? 'animate-pulse' : ''}`}
      >
        <div className="flex items-center">
          {loading ? (
            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <IconToShow
              className={`w-4 h-4 mr-2 ${
                state === 'success' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
              }`}
            />
          )}
          <span className="text-sm font-medium">{children}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
            <Settings className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mt-4">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account preferences and security settings.
          </p>
        </div>

        <Card className="bg-white/90 dark:bg-gray-800/90 border dark:border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Lock className="w-6 h-6 mr-3 text-gray-600 animate-pulse" />
              Account Security & Data
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Secure your account and manage your personal data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActionButton
              onClick={handlePasswordChange}
              icon={Edit}
              state={actionStates.password}
            >
              {actionStates.password === 'processing'
                ? 'Updating Password...'
                : actionStates.password === 'success'
                ? 'Password Update Sent ✓'
                : 'Change Password'}
            </ActionButton>

            <ActionButton
              onClick={handleDownloadHistory}
              icon={isDownloading ? Download : Package}
              loading={isDownloading}
              state={actionStates.download}
            >
              {isDownloading
                ? 'Downloading History...'
                : actionStates.download === 'success'
                ? 'Download Complete ✓'
                : 'Download Order History'}
            </ActionButton>

            <ActionButton
              onClick={handleLogoutDevices}
              icon={ShieldAlert}
              state={actionStates.logout}
            >
              {actionStates.logout === 'processing'
                ? 'Logging Out...'
                : actionStates.logout === 'success'
                ? 'Logged Out ✓'
                : 'Logout from All Devices'}
            </ActionButton>

            {showDeleteConfirm && (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg space-y-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600 animate-ping" />
                  <span className="font-semibold text-red-800 dark:text-red-200">
                    This action is irreversible!
                  </span>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  Your account and all associated data will be permanently deleted.
                </p>
                <p className="text-xs text-red-800 dark:text-red-200">
                  You will have 24 hours to cancel via confirmation email.
                </p>
              </div>
            )}

            <ActionButton
              onClick={handleDeleteAccount}
              icon={showDeleteConfirm ? AlertTriangle : Trash2}
              destructive
            >
              {showDeleteConfirm ? '🗑️ PERMANENTLY DELETE MY ACCOUNT' : 'Delete Account'}
            </ActionButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerSettings;
