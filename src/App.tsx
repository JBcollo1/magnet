// frontend/magnet/src/App.tsx

import React from "react"; // Ensure React is imported
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { CartProvider } from "./contexts/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard"; // This is now your CUSTOMER Dashboard container
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Footer from "./pages/footer";

const queryClient = new QueryClient();

// A simple PrivateRoute component for basic authentication/authorization
interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("ADMIN" | "CUSTOMER" | "STAFF")[]; // Optional: define allowed roles
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Loading user session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Type assertion for user, assuming user object always has a role property
  const userRole = (user as { role: "ADMIN" | "CUSTOMER" | "STAFF" })?.role;

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // If the user is authenticated but doesn't have the allowed role:
    // Redirect admins/staff to their specific dashboards if they try to access customer dashboard directly
    if (userRole === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    // You can add more specific redirects here, or just a generic one
    // For now, if a staff tries to access /dashboard, they'll be sent back to /admin (which will redirect to their own dashboard)
    // or you can direct them to / if there's no staff-specific dashboard
    return <Navigate to="/" replace />; // Or to a default landing page
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

                {/* Auth Password Reset Routes */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Protected Customer Dashboard Route */}
                {/* Only 'CUSTOMER' role is explicitly allowed to access the /dashboard route.
                    Admin and Staff will be redirected by the PrivateRoute. */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute allowedRoles={["CUSTOMER"]}>
                      <Dashboard /> {/* This is your refactored customer dashboard container */}
                    </PrivateRoute>
                  }
                />

                {/* Protected Admin Route */}
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute allowedRoles={["ADMIN"]}>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />

                {/* Fallback Not Found */}
                <Route path="*" element={<NotFound />} />
                {/* Footer Route */}
                
              </Routes>
              <Footer />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;