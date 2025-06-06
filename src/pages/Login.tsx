import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Helper function to check if error is an Axios error
const isAxiosError = (error) => {
  return error && error.isAxiosError === true;
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const resetTokenFromUrl = searchParams.get('token') || (location.pathname.match(/\/reset-password\/([^\/]+)/)?.[1]);

  const [currentView, setCurrentView] = useState('signin');
  const [token, setToken] = useState(resetTokenFromUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tokenValidated, setTokenValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const resetFormStates = useCallback(() => {
    setError('');
    setSuccessMessage('');
    setIsLoading(false);
    setTokenValidated(false);
    setSignInData({ email: '', password: '' });
    setForgotPasswordEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const toggleForm = useCallback((view) => {
    setCurrentView(view);
    resetFormStates();
  }, [resetFormStates]);

  const validateResetToken = useCallback(async (tokenToValidate) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setTokenValidated(false);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/reset-password/${tokenToValidate}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const msg = (response.data as { msg?: string }).msg || 'Token is valid. You can now reset your password.';
        setSuccessMessage(msg);
        setTokenValidated(true);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      let errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      setError(errorMessage);
      setTokenValidated(false);

      setTimeout(() => {
        toggleForm('forgot-password');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }, [toggleForm]);

  useEffect(() => {
    if (resetTokenFromUrl) {
      setCurrentView('reset-password');
      setToken(resetTokenFromUrl);
      validateResetToken(resetTokenFromUrl);
    }
  }, [resetTokenFromUrl, validateResetToken]);

  const handleSignInChange = (e) => {
    const { id, value } = e.target;
    setSignInData(prev => ({ ...prev, [id]: value }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const success = await login(signInData.email, signInData.password);

      if (success) {
        setSuccessMessage('Welcome back! You have successfully logged in.');
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      } else {
        setError('Invalid email or password. Please try again.');
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = 'An error occurred. Please try again.';
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        { email: forgotPasswordEmail },
        { withCredentials: true }
      );

      setSuccessMessage('Password reset link sent to your email!');
      toast({
        title: "Reset link sent",
        description: "Password reset link sent to your email!",
      });
    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      setError('Password must contain both letters and numbers.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`,
        { password: newPassword },
        { withCredentials: true }
      );

      setSuccessMessage('Password reset successful! Redirecting to sign in...');
      toast({
        title: "Password reset successful",
        description: "Password reset successful! Redirecting to sign in...",
      });

      setTimeout(() => {
        toggleForm('signin');
        navigate('/login');
      }, 2000);
    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          {currentView === 'signin' && (
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                  Sign in to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}
                {successMessage && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="email">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={signInData.email}
                        onChange={handleSignInChange}
                        placeholder="your.email@example.com"
                        className="pl-10 h-12 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={signInData.password}
                        onChange={handleSignInChange}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-12 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-200"
                    >
                      Sign up here
                    </Link>
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleForm('forgot-password')}
                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all duration-200"
                  >
                    Forgot password?
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentView === 'forgot-password' && (
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Forgot Password
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                  Enter your email to receive a password reset link
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}
                {successMessage && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="forgot-email">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="pl-10 h-12 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => toggleForm('signin')}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentView === 'reset-password' && (
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                  Enter your new password below
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}
                {successMessage && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
                  </div>
                )}

                {isLoading && (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Validating reset link...</p>
                  </div>
                )}

                {!isLoading && !tokenValidated && !error && resetTokenFromUrl && (
                  <div className="text-center py-8">
                    <div className="animate-pulse">
                      <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-4"></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Please wait while we validate your reset link, or it might be invalid/expired.
                    </p>
                  </div>
                )}

                {!isLoading && tokenValidated && !error && (
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="new-password">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                          className="pl-10 pr-10 h-12 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Password must be at least 8 characters long and include both letters and numbers
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="confirm-password">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                          className="pl-10 pr-10 h-12 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                      {newPassword && confirmPassword && newPassword === confirmPassword && (
                        <p className="text-xs text-green-600">Passwords match ✓</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={
                        isLoading ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword ||
                        newPassword.length < 8 ||
                        !(/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword))
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </form>
                )}

                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => toggleForm('signin')}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
