import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // Import useAuth
import { ThemeProvider } from "./contexts/ThemeContext";
import React from 'react'; // Ensure React is imported

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/Admin/AdminDashboard"; // Import AdminDashboard

const queryClient = new QueryClient();

// A simple PrivateRoute component for basic authentication/authorization
interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'CUSTOMER' | 'STAFF')[]; // Optional: define allowed roles
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if the user's role is allowed
  if (allowedRoles && user) {
    const userRole = (user as any).role; // Assuming user.role exists
    if (!allowedRoles.includes(userRole)) {
      // Authenticated but not authorized for this role, redirect to a safe page
      return <Navigate to="/dashboard" replace />; // or a 403 Forbidden page
    }
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Password Reset Routes */}
                <Route
                  path="/reset-password/:token"
                  element={<Login initialView="reset-password" />}
                />
                <Route
                  path="/reset-password"
                  element={<Login initialView="reset-password" />}
                />

                {/* Authenticated User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute allowedRoles={['CUSTOMER', 'ADMIN', 'STAFF']}>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

                {/* Admin Routes - Protected */}
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />

                {/* Fallback 404 page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;