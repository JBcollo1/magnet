import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    // Base classes are for Light Mode, dark: classes for Dark Mode
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-[#303030] dark:bg-[#121212]/95 dark:supports-[backdrop-filter]:bg-[#121212]/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group" onClick={closeMobileMenu}>
          <div className="h-8 w-8 bg-teal-600 rounded-md flex items-center justify-center group-hover:bg-teal-700 transition-colors dark:bg-[#00C896] dark:group-hover:bg-[#00BFA6]">
            <span className="text-white font-bold dark:text-[#121212]">MC</span>
          </div>
          <span className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors dark:text-[#E0E0E0] dark:group-hover:text-[#00C896]">MagnetCraft</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-teal-600 transition-colors font-medium dark:text-gray-400 dark:hover:text-[#00C896]">
            Home
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-teal-600 transition-colors font-medium dark:text-gray-400 dark:hover:text-[#00C896]">
            About
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-teal-600 transition-colors font-medium dark:text-gray-400 dark:hover:text-[#00C896]">
            Contact
          </Link>
          {user && (
            <Link to="/dashboard" className="text-gray-600 hover:text-teal-600 transition-colors font-medium dark:text-gray-400 dark:hover:text-[#00C896]">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          
          <Link to="/cart">
            <Button variant="outline" size="sm" className="relative bg-gray-100 border-gray-200 text-gray-700 hover:bg-teal-500 hover:border-teal-500 hover:text-white transition-all dark:bg-[#2D2D2D] dark:border-[#303030] dark:text-[#E0E0E0] dark:hover:bg-[#00C896] dark:hover:border-[#00C896] dark:hover:text-[#121212]">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg dark:bg-[#00C896] dark:text-[#121212]">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 max-w-32 truncate dark:text-gray-400">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all dark:bg-[#2D2D2D] dark:border-[#303030] dark:text-[#E0E0E0]">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-teal-500 hover:border-teal-500 hover:text-white transition-all dark:bg-[#2D2D2D] dark:border-[#303030] dark:text-[#E0E0E0] dark:hover:bg-[#00C896] dark:hover:border-[#00C896] dark:hover:text-[#121212]">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700 font-semibold transition-colors dark:bg-[#00BFA6] dark:text-[#121212] dark:hover:bg-[#1DB954]">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center space-x-2">
          <Link to="/cart" onClick={closeMobileMenu}>
            <Button variant="outline" size="sm" className="relative bg-gray-100 border-gray-200 text-gray-700 hover:bg-teal-500 hover:border-teal-500 hover:text-white transition-all dark:bg-[#2D2D2D] dark:border-[#303030] dark:text-[#E0E0E0] dark:hover:bg-[#00C896] dark:hover:border-[#00C896] dark:hover:text-[#121212]">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg dark:bg-[#00C896] dark:text-[#121212]">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden bg-gray-100 border-gray-200 text-gray-700 hover:bg-teal-500 hover:border-teal-500 hover:text-white transition-all dark:bg-[#2D2D2D] dark:border-[#303030] dark:text-[#E0E0E0] dark:hover:bg-[#00C896] dark:hover:border-[#00C896] dark:hover:text-[#121212]"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-gray-50 shadow-lg dark:border-[#303030] dark:bg-[#2D2D2D]">
          <div className="container py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-teal-600 transition-colors py-2 font-medium border-b border-gray-200 last:border-b-0 dark:text-gray-400 dark:hover:text-[#00C896] dark:border-[#303030]"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-teal-600 transition-colors py-2 font-medium border-b border-gray-200 last:border-b-0 dark:text-gray-400 dark:hover:text-[#00C896] dark:border-[#303030]"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-600 hover:text-teal-600 transition-colors py-2 font-medium border-b border-gray-200 last:border-b-0 dark:text-gray-400 dark:hover:text-[#00C896] dark:border-[#303030]"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              {user && (
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-teal-600 transition-colors py-2 font-medium border-b border-gray-200 last:border-b-0 dark:text-gray-400 dark:hover:text-[#00C896] dark:border-[#303030]"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Mobile Auth Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-4 dark:border-[#303030]">
              {/* Theme Toggle in Mobile Menu */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 font-medium dark:text-gray-400">Theme</span>
                <ThemeToggle />
              </div>

              {user ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded-md border border-gray-200 dark:text-gray-400 dark:bg-[#121212] dark:border-[#303030]">
                    Signed in as: <span className="font-medium text-teal-600 dark:text-[#00C896]">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-full justify-center bg-gray-100 border-gray-200 text-gray-700 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all dark:bg-[#121212] dark:border-[#303030] dark:text-[#E0E0E0]"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" onClick={closeMobileMenu} className="block">
                    <Button variant="outline" size="sm" className="w-full justify-center bg-gray-100 border-gray-200 text-gray-700 hover:bg-teal-500 hover:border-teal-500 hover:text-white transition-all dark:bg-[#121212] dark:border-[#303030] dark:text-[#E0E0E0] dark:hover:bg-[#00C896] dark:hover:border-[#00C896] dark:hover:text-[#121212]">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={closeMobileMenu} className="block">
                    <Button size="sm" className="w-full justify-center bg-teal-600 text-white hover:bg-teal-700 font-semibold transition-colors dark:bg-[#00BFA6] dark:text-[#121212] dark:hover:bg-[#1DB954]">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;