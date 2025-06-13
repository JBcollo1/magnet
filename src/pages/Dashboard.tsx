// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import CustomerDashboard from './Customer/CustomerDashboard';
import CustomerProfile from './Customer/CustomerProfile';
import CustomerOrders from './Customer/CustomerOrders';
import CustomerSettings from './Customer/CustomerSettings';

// Import the unified Order interface from CustomerOrders
import { Order } from './Customer/CustomerOrders';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
}

// Updated mock orders to match the unified Order interface
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    order_number: 'ORD-20231201-12345678',
    date: '2024-12-01',
    items: '4 Custom Magnets',
    total: 800,
    status: 'Delivered',
    paymentMethod: 'M-Pesa',
    trackingNumber: 'TRK001234',
    estimatedDelivery: '2024-12-05',
    paymentStatus: 'completed',
    paymentId: 'MPESA-001234567890',
    paymentAmount: 800,
    paymentDate: '2024-12-01',
    verificationDate: '2024-12-01',
    isCompleted: true,
    verifiedBy: {
      admin_name: 'Admin User',
      verification_date: '2024-12-01'
    }
  },
  {
    id: 'ORD-002',
    order_number: 'ORD-20231215-23456789',
    date: '2024-12-15',
    items: '6 Custom Magnets',
    total: 1200,
    status: 'Processing',
    paymentMethod: 'M-Pesa',
    trackingNumber: 'TRK001235',
    estimatedDelivery: '2024-12-20',
    paymentStatus: 'pending',
    paymentId: 'MPESA-001234567891',
    paymentAmount: 1200,
    paymentDate: '2024-12-15',
    isPending: true
  },
  {
    id: 'ORD-003',
    order_number: 'ORD-20231220-34567890',
    date: '2024-12-20',
    items: '2 Custom Magnets',
    total: 400,
    status: 'Pending',
    paymentMethod: 'M-Pesa',
    trackingNumber: 'TRK001236',
    estimatedDelivery: '2024-12-25',
    paymentStatus: 'no_payment'
  }
];

// Helper function to check if error is an Axios error
const isAxiosError = (error: any): error is { code?: string; response?: { status: number } } => {
  return error && (error.code !== undefined || error.response !== undefined);
};

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        const loadData = async () => {
          setDataLoading(true);
          setError(null);
          try {
            await fetchUserOrders();
          } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Dashboard loading error:', err);
          } finally {
            setDataLoading(false);
          }
        };
        loadData();
      }
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const fetchUserOrders = async () => {
    try {
      const response = await axios.get<{ orders: Order[] }>(
        `${import.meta.env.VITE_API_URL}/orders`,
        { 
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );

      // Ensure we have an array of orders
      const ordersData = Array.isArray(response.data.orders) 
        ? response.data.orders 
        : Array.isArray(response.data) 
          ? response.data 
          : [];

      if (ordersData.length === 0) {
        console.log('No orders found, using mock data');
        setOrders(mockOrders);
      } else {
        // Transform API data to match our Order interface if needed
        const transformedOrders = ordersData.map(order => ({
          ...order,
          // Ensure date is properly formatted
          date: order.date || new Date().toISOString().split('T')[0],
          // Ensure items is a string
          items: typeof order.items === 'string' ? order.items : JSON.stringify(order.items)
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      
      // Check if it's a network error or server error
      if (isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.log('Request timeout, using mock data');
        } else if (error.response?.status === 404) {
          console.log('Orders endpoint not found, using mock data');
        } else if (error.response?.status && error.response.status >= 500) {
          console.log('Server error, using mock data');
        } else {
          console.log('API error, using mock data');
        }
      }
      
      // Fallback to mock data
      setOrders(mockOrders);
    }
  };

  const handleOrdersUpdate = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
  };

  const refreshData = async () => {
    await fetchUserOrders();
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-900 dark:text-gray-100" />
          <p className="text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'CUSTOMER') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300">Access denied. Customer account required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account, track your magnet orders, and view payment status verified by our admin team.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                ⚠️ {error} - Showing cached data
              </p>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500"
            >
              My Profile
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500"
            >
              Order History
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <CustomerDashboard orders={orders} onRefresh={refreshData} />
          </TabsContent>

          <TabsContent value="profile">
            <CustomerProfile />
          </TabsContent>

          <TabsContent value="orders">
            <CustomerOrders orders={orders} onOrdersUpdate={handleOrdersUpdate} />
          </TabsContent>

          <TabsContent value="settings">
            <CustomerSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;