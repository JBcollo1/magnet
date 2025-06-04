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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold">MC</span>
          </div>
          <span className="text-xl font-bold">MagnetCraft</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-foreground/80 hover:text-foreground transition-colors">
            Contact
          </Link>
          {user && (
            <Link to="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          
          <Link to="/cart">
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-foreground/80 max-w-32 truncate">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center space-x-2">
          <Link to="/cart" onClick={closeMobileMenu}>
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
            className="md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b bg-background">
          <div className="container py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-foreground/80 hover:text-foreground transition-colors py-2"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-foreground/80 hover:text-foreground transition-colors py-2"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-foreground/80 hover:text-foreground transition-colors py-2"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              {user && (
                <Link 
                  to="/dashboard" 
                  className="text-foreground/80 hover:text-foreground transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Mobile Auth Actions */}
            <div className="pt-4 border-t space-y-4">
              {/* Theme Toggle in Mobile Menu */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/80">Theme</span>
                <ThemeToggle />
              </div>

              {user ? (
                <div className="space-y-3">
                  <div className="text-sm text-foreground/80">
                    Signed in as: <span className="font-medium">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-full justify-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" onClick={closeMobileMenu} className="block">
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={closeMobileMenu} className="block">
                    <Button size="sm" className="w-full justify-center">
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