import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Import the auth context
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetFormStates = useCallback(() => {
    setError('');
    setSuccessMessage('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsSubmitting(false);
  }, []);

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z\d]/.test(password)) strength += 1;

    const strengthMap = {
      0: { text: 'Very Weak', color: 'bg-red-500' },
      1: { text: 'Weak', color: 'bg-red-400' },
      2: { text: 'Fair', color: 'bg-yellow-500' },
      3: { text: 'Good', color: 'bg-blue-500' },
      4: { text: 'Strong', color: 'bg-green-500' },
      5: { text: 'Very Strong', color: 'bg-green-600' }
    };

    return { strength, ...strengthMap[strength as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setError('');
    setSuccessMessage('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match.';
      setError(errorMsg);
      toast({
        title: "Password mismatch",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      const errorMsg = 'Password must be at least 8 characters long and contain letters and numbers.';
      setError(errorMsg);
      toast({
        title: "Weak password",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      const errorMsg = 'Name is required.';
      setError(errorMsg);
      toast({
        title: "Missing information",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await signup(formData.email, formData.password, formData.name.trim());

      if (success) {
        setSuccessMessage('Account created successfully! Welcome to MagnetCraft Kenya!');
        toast({
          title: "Account created!",
          description: "Welcome to MagnetCraft Kenya! Your account has been created successfully.",
        });
        resetFormStates();
        // Navigate to dashboard or home page since user is now authenticated
        navigate('/dashboard');
      } else {
        const errorMsg = 'Failed to create account. Please try again.';
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Join MagnetCraft Kenya and start creating amazing magnets
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="pl-10 h-12 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="pl-10 h-12 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter a strong password"
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
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Password strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.strength <= 2 ? 'text-red-500' :
                          passwordStrength.strength <= 3 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Password must be at least 8 characters long and include both letters and numbers
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 h-12 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password && (
                    <div className="flex items-center gap-2 mt-2">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-green-600 dark:text-green-400">Passwords match</p>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-xs text-red-500">Passwords do not match</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isSubmitting || loading || !formData.name.trim() || !formData.email || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                >
                  {(isSubmitting || loading) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-200"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;