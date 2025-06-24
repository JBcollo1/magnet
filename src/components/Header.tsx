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
    <header className="sticky top-0 z-50 w-full border-b border-[#303030] bg-[#121212]/95 backdrop-blur supports-[backdrop-filter]:bg-[#121212]/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group" onClick={closeMobileMenu}>
          <div className="h-8 w-8 bg-[#00C896] rounded-md flex items-center justify-center group-hover:bg-[#00BFA6] transition-colors">
            <span className="text-[#121212] font-bold">MC</span>
          </div>
          <span className="text-xl font-bold text-[#E0E0E0] group-hover:text-[#00C896] transition-colors">MagnetCraft</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-400 hover:text-[#00C896] transition-colors font-medium">
            Home
          </Link>
          <Link to="/about" className="text-gray-400 hover:text-[#00C896] transition-colors font-medium">
            About
          </Link>
          <Link to="/contact" className="text-gray-400 hover:text-[#00C896] transition-colors font-medium">
            Contact
          </Link>
          {user && (
            <Link to="/dashboard" className="text-gray-400 hover:text-[#00C896] transition-colors font-medium">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          
          <Link to="/cart">
            <Button variant="outline" size="sm" className="relative bg-[#2D2D2D] border-[#303030] text-[#E0E0E0] hover:bg-[#00C896] hover:border-[#00C896] hover:text-[#121212] transition-all">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#00C896] text-[#121212] text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400 max-w-32 truncate">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="bg-[#2D2D2D] border-[#303030] text-[#E0E0E0] hover:bg-red-600 hover:border-red-600 hover:text-white transition-all">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="bg-[#2D2D2D] border-[#303030] text-[#E0E0E0] hover:bg-[#00C896] hover:border-[#00C896] hover:text-[#121212] transition-all">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-[#00BFA6] text-[#121212] hover:bg-[#1DB954] font-semibold transition-colors">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center space-x-2">
          <Link to="/cart" onClick={closeMobileMenu}>
            <Button variant="outline" size="sm" className="relative bg-[#2D2D2D] border-[#303030] text-[#E0E0E0] hover:bg-[#00C896] hover:border-[#00C896] hover:text-[#121212] transition-all">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#00C896] text-[#121212] text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg">
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
            className="md:hidden bg-[#2D2D2D] border-[#303030] text-[#E0E0E0] hover:bg-[#00C896] hover:border-[#00C896] hover:text-[#121212] transition-all"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#303030] bg-[#2D2D2D] shadow-lg">
          <div className="container py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-gray-400 hover:text-[#00C896] transition-colors py-2 font-medium border-b border-[#303030] last:border-b-0"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-gray-400 hover:text-[#00C896] transition-colors py-2 font-medium border-b border-[#303030] last:border-b-0"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-400 hover:text-[#00C896] transition-colors py-2 font-medium border-b border-[#303030] last:border-b-0"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              {user && (
                <Link 
                  to="/dashboard" 
                  className="text-gray-400 hover:text-[#00C896] transition-colors py-2 font-medium border-b border-[#303030] last:border-b-0"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Mobile Auth Actions */}
            <div className="pt-4 border-t border-[#303030] space-y-4">
              {/* Theme Toggle in Mobile Menu */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-400 font-medium">Theme</span>
                <ThemeToggle />
              </div>

              {user ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-400 bg-[#121212] p-3 rounded-md border border-[#303030]">
                    Signed in as: <span className="font-medium text-[#00C896]">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-full justify-center bg-[#121212] border-[#303030] text-[#E0E0E0] hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" onClick={closeMobileMenu} className="block">
                    <Button variant="outline" size="sm" className="w-full justify-center bg-[#121212] border-[#303030] text-[#E0E0E0] hover:bg-[#00C896] hover:border-[#00C896] hover:text-[#121212] transition-all">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={closeMobileMenu} className="block">
                    <Button size="sm" className="w-full justify-center bg-[#00BFA6] text-[#121212] hover:bg-[#1DB954] font-semibold transition-colors">
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