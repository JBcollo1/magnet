import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react'; // Only Loader2 is used for loading state
import { Badge } from '@/components/ui/badge';

// Import the sub-components that will be rendered inside tabs
import AdminStats from './AdminStats';
import SystemReports from './SystemReports';
import UserManagement from './UserManagement';

interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: string;
  paymentMethod: string;
  customer: string;
}

// Updated UserData interface to match what UserManagement expects
interface UserData {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
  is_active: boolean;
  created_at: string;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
}

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const isAdmin = (user as AppUser)?.role === 'ADMIN';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      // Redirect non-admin users if they try to access the admin dashboard
      navigate('/dashboard'); // or home page
    }
  }, [isAuthenticated, authLoading, navigate, isAdmin]);

  const fetchAdminData = async () => {
    if (!isAdmin) return; // Only fetch if user is admin

    try {
      const [usersResponse, ordersResponse] = await Promise.all([
        axios.get<UserData[]>(`${import.meta.env.VITE_API_URL}/admin/users`, { withCredentials: true }),
        axios.get<Order[]>(`${import.meta.env.VITE_API_URL}/admin/orders`, { withCredentials: true })
      ]);

      const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      const ordersData = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];

      setAllUsers(usersData);
      setAllOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      // Updated fallback data to include the missing properties
      setAllUsers([
        { 
          id: '1', 
          name: 'John Doe', 
          email: 'john@example.com', 
          orders: 3, 
          totalSpent: 2400,
          role: 'CUSTOMER',
          is_active: true,
          created_at: '2024-01-15T10:30:00Z'
        },
        { 
          id: '2', 
          name: 'Jane Smith', 
          email: 'jane@example.com', 
          orders: 1, 
          totalSpent: 800,
          role: 'CUSTOMER',
          is_active: true,
          created_at: '2024-02-20T14:15:00Z'
        },
        { 
          id: '3', 
          name: 'Mike Johnson', 
          email: 'mike@example.com', 
          orders: 2, 
          totalSpent: 2900,
          role: 'CUSTOMER',
          is_active: false,
          created_at: '2024-01-08T09:45:00Z'
        }
      ]);
      setAllOrders([
        { id: 'ORD-001', customer: 'John Doe', items: '4-CUSTOM MAGNETS', total: 800, status: 'delivered', date: '2024-12-01', paymentMethod: 'M-Pesa' },
        { id: 'ORD-002', customer: 'Jane Smith', items: '6-CUSTOM MAGNETS', total: 1200, status: 'pending', date: '2024-12-15', paymentMethod: 'M-Pesa' },
        { id: 'ORD-003', customer: 'Mike Johnson', items: '12-CUSTOM MAGNETS', total: 2200, status: 'shipped', date: '2024-12-10', paymentMethod: 'M-Pesa' },
        { id: 'ORD-004', customer: 'Mike Johnson', items: '9-CUSTOM MAGNETS', total: 1700, status: 'delivered', date: '2024-11-28', paymentMethod: 'M-Pesa' }
      ]);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      setDataLoading(true);
      fetchAdminData();
    }
  }, [user, isAdmin]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !isAdmin) {
    return null; // Redirect handled by useEffect
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing':
      case 'pending': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, Admin {user?.name}!</h1>
          <p className="text-gray-600">
            Manage your magnet business with ease.
          </p>
        </div>

        {/* This is the primary navigation using Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">All Orders</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reports">System Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* AdminStats component receives data directly */}
            <AdminStats allOrders={allOrders} />

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                          <p className="text-xs text-gray-500">{order.items}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">KSh {order.total.toLocaleString()}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>Highest spending customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allUsers
                      .sort((a, b) => b.totalSpent - a.totalSpent)
                      .slice(0, 5)
                      .map((customer, index) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">KSh {customer.totalSpent.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{customer.orders} orders</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>Manage all customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>KSh {order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* UserManagement component receives allUsers as a prop */}
            <UserManagement allUsers={allUsers} />
          </TabsContent>

          <TabsContent value="reports">
            {/* SystemReports component receives allOrders and getStatusColor as props */}
            <SystemReports allOrders={allOrders} getStatusColor={getStatusColor} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;