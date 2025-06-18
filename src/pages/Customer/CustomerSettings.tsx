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
  AlertTriangle
} from 'lucide-react';

const CustomerSettings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handlePasswordChange = () => {
    toast.success('Redirecting to password update...', {
      description: 'You will be redirected to a secure password update form.',
      duration: 3000,
    });
  };

  const handleDownloadHistory = async () => {
    setIsDownloading(true);
    toast.info('Preparing your order history...', {
      description: 'This may take a few moments for large order histories.',
    });

    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      toast.success('Order history downloaded successfully!', {
        description: 'Check your downloads folder for the file.',
      });
    }, 2000);
  };

  const handleDeleteAccount = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      toast.error('Account deletion requires confirmation.', {
        description: 'This action cannot be undone. Please confirm below.',
      });
    } else {
      toast.error('Account deletion initiated.', {
        description: 'You will receive an email with further instructions.',
      });
      setShowDeleteConfirm(false);
    }
  };

  const handleLogoutDevices = () => {
    toast('Logged out from all devices for security.', {
      description: 'You will need to log back in on all your devices.',
      duration: 4000,
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast.info(`${isDarkMode ? 'Light' : 'Dark'} mode enabled`, {
      description: 'Your preference has been saved.',
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`, {
      description: 'Your notification preferences have been updated.',
    });
  };

  type ButtonVariant = "outline" | "destructive" | "link" | "default" | "secondary" | "ghost" | null | undefined;

  const ActionButton = ({
    onClick,
    variant = "outline",
    icon: Icon,
    children,
    loading = false,
    destructive = false,
  }: {
    onClick: () => void;
    variant?: ButtonVariant;
    icon: React.ElementType;
    children: React.ReactNode;
    loading?: boolean;
    destructive?: boolean;
  }) => (
    <Button
      onClick={onClick}
      variant={destructive ? "destructive" : variant}
      className={`w-full justify-between group transition-all duration-200 ${
        destructive
          ? 'hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md hover:scale-[1.02]'
      }`}
      disabled={loading}
      aria-label={typeof children === 'string' ? children : 'Button'}
      role="button"
    >
      <div className="flex items-center">
        {loading ? (
          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Icon className="w-4 h-4 mr-2" />
        )}
        {children}
      </div>
      <ChevronRight className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1" />
    </Button>
  );

  const ToggleCard = ({ title, description, icon: Icon, enabled, onToggle, gradient }: {
    title: string;
    description: string;
    icon: React.ElementType;
    enabled: boolean;
    onToggle: () => void;
    gradient: string;
  }) => (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        enabled
          ? `bg-gradient-to-br ${gradient} text-white ring-2 ring-white/50`
          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
      } rounded-2xl`}
      onClick={onToggle}
      role="button"
      aria-label={`${title} toggle`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${enabled ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900'}`}>
              <Icon className={`w-5 h-5 ${enabled ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
            </div>
            <div>
              <h3 className={`font-medium ${enabled ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                {title}
              </h3>
              <p className={`text-sm ${enabled ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                {description}
              </p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
            enabled
              ? 'bg-white/30'
              : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <div className={`w-5 h-5 rounded-full transition-all duration-300 ${
              enabled
                ? 'bg-white translate-x-6'
                : 'bg-white dark:bg-gray-300 translate-x-0.5'
            } mt-0.5`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SettingsCard = ({ title, description, icon: Icon, gradient, onClick }: {
    title: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
    onClick: () => void;
  }) => (
    <Card
      onClick={onClick}
      className={`cursor-pointer bg-gradient-to-br ${gradient} border-blue-200 dark:border-blue-800 transition-all hover:scale-[1.02] hover:shadow-md rounded-2xl`}
      role="button"
      aria-label={title}
    >
      <CardContent className="p-6 text-center">
        <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Toggles */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Settings
            </h2>

            <ToggleCard
              title="Dark Mode"
              description="Switch between light and dark themes"
              icon={isDarkMode ? Moon : Sun}
              enabled={isDarkMode}
              onToggle={toggleDarkMode}
              gradient="from-purple-500 to-blue-600"
            />

            <ToggleCard
              title="Notifications"
              description="Receive updates about your orders"
              icon={Bell}
              enabled={notificationsEnabled}
              onToggle={toggleNotifications}
              gradient="from-green-500 to-teal-600"
            />
          </div>

          {/* Account Actions */}
          <Card
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl"
            onMouseEnter={() => setHoveredCard('actions')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                Account Actions
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Manage your login security and personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ActionButton
                onClick={handlePasswordChange}
                icon={Edit}
                aria-label="Change Password"
              >
                Change Password
              </ActionButton>

              <ActionButton
                onClick={handleDownloadHistory}
                icon={isDownloading ? Download : Package}
                loading={isDownloading}
                aria-label="Download Order History"
              >
                {isDownloading ? 'Preparing Download...' : 'Download Order History'}
              </ActionButton>

              <ActionButton
                onClick={handleLogoutDevices}
                icon={ShieldAlert}
                aria-label="Logout from All Devices"
              >
                Logout from All Devices
              </ActionButton>

              {showDeleteConfirm && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      Are you absolutely sure?
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              )}

              <ActionButton
                onClick={handleDeleteAccount}
                icon={showDeleteConfirm ? AlertTriangle : Trash2}
                destructive={true}
                aria-label="Delete Account"
              >
                {showDeleteConfirm ? 'Confirm Account Deletion' : 'Delete Account'}
              </ActionButton>
            </CardContent>
          </Card>
        </div>

        <hr className="my-8 border-t border-gray-300 dark:border-gray-700" />

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <SettingsCard
            title="Email Settings"
            description="Manage your email preferences"
            icon={Mail}
            gradient="from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20"
            onClick={() => toast.info("Email settings feature coming soon!")}
          />

          <SettingsCard
            title="Payment Methods"
            description="Update your payment options"
            icon={CreditCard}
            gradient="from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20"
            onClick={() => toast.info("Payment methods feature coming soon!")}
          />

          <SettingsCard
            title="Language & Region"
            description="Customize your locale settings"
            icon={Globe}
            gradient="from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20"
            onClick={() => toast.info("Language settings feature coming soon!")}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;
