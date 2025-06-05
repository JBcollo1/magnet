import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { User, ShoppingBag, Star, Settings, MapPin, Edit, Save, Package, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminDashboard, { AdminOverviewCards } from './AdminDashboard';

interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: string;
  paymentMethod: string;
  customer?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
}

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Update userDetails when user data changes
  useEffect(() => {
    if (user) {
      setUserDetails(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  // Redirect if not authenticated and not loading
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/profile/details`,
        { withCredentials: true }
      );
      
      if (response.data) {
        setUserDetails(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Fetch user orders
  const fetchUserOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders`,
        { withCredentials: true }
      );
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Use mock data if API fails
      setOrders([
        {
          id: 'ORD-001',
          date: '2024-12-01',
          items: '4-CUSTOM MAGNETS',
          total: 800,
          status: 'Delivered',
          paymentMethod: 'M-Pesa'
        },
        {
          id: 'ORD-002',
          date: '2024-12-15',
          items: '6-CUSTOM MAGNETS',
          total: 1200,
          status: 'Processing',
          paymentMethod: 'M-Pesa'
        }
      ]);
    }
  };

  // Fetch admin data (all users and orders)
  const fetchAdminData = async () => {
    if (!isAdmin) return;

    try {
      const [usersResponse, ordersResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/orders`, { withCredentials: true })
      ]);

      setAllUsers(usersResponse.data || []);
      setAllOrders(ordersResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      // Use mock data if API fails
      setAllUsers([
        { id: '1', name: 'John Doe', email: 'john@example.com', orders: 3, totalSpent: 2400 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', orders: 1, totalSpent: 800 },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', orders: 2, totalSpent: 2900 }
      ]);
      setAllOrders([
        { id: 'ORD-001', customer: 'John Doe', items: '4-CUSTOM MAGNETS', total: 800, status: 'Delivered', date: '2024-12-01', paymentMethod: 'M-Pesa' },
        { id: 'ORD-002', customer: 'Jane Smith', items: '6-CUSTOM MAGNETS', total: 1200, status: 'Processing', date: '2024-12-15', paymentMethod: 'M-Pesa' },
        { id: 'ORD-003', customer: 'Mike Johnson', items: '12-CUSTOM MAGNETS', total: 2200, status: 'Shipped', date: '2024-12-10', paymentMethod: 'M-Pesa' },
        { id: 'ORD-004', customer: 'Mike Johnson', items: '9-CUSTOM MAGNETS', total: 1700, status: 'Delivered', date: '2024-11-28', paymentMethod: 'M-Pesa' }
      ]);
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setDataLoading(true);
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchUserOrders(),
          fetchAdminData()
        ]);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Show loading spinner while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isAdmin = user?.email === 'admin123@gmail.com';

  const handleSaveDetails = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/profile/details`,
        userDetails,
        { withCredentials: true }
      );

      // Refresh user data from backend
      await refreshUser();
      
      setIsEditing(false);
      toast({
        title: "Details updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-100';
      case 'Shipped': return 'text-blue-600 bg-blue-100';
      case 'Processing': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Regular user overview cards
  const UserOverviewCards = () => (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{totalItemsInCart}</div>
          <p className="text-xs text-muted-foreground">Items in your cart</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
          <p className="text-xs text-muted-foreground">Your orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            KSh {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Total value</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Status</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Active</div>
          <p className="text-xs text-muted-foreground">Account standing</p>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Admin Dashboard - Manage your magnet business' : 'Manage your account and track your magnet orders.'}
          </p>
        </div>

        {/* Show loading spinner while fetching data */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading dashboard data...</span>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isAdmin ? (
                <AdminOverviewCards 
                  allOrders={allOrders} 
                  totalItemsInCart={totalItemsInCart} 
                />
              ) : (
                <UserOverviewCards />
              )}
            </div>

            <Tabs defaultValue={isAdmin ? "overview" : "profile"} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">My Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                {isAdmin && <TabsTrigger value="users">All Users</TabsTrigger>}
                {isAdmin && <TabsTrigger value="overview">Admin Overview</TabsTrigger>}
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>Your account details and contact information</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => isEditing ? handleSaveDetails() : setIsEditing(true)}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : isEditing ? (
                            <Save className="w-4 h-4 mr-2" />
                          ) : (
                            <Edit className="w-4 h-4 mr-2" />
                          )}
                          {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          {isEditing ? (
                            <Input
                              value={userDetails.name}
                              onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                            />
                          ) : (
                            <p className="font-medium">{userDetails.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          {isEditing ? (
                            <Input
                              value={userDetails.email}
                              onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                            />
                          ) : (
                            <p className="font-medium">{userDetails.email}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone Number</label>
                        {isEditing ? (
                          <Input
                            value={userDetails.phone}
                            onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                            placeholder="+254 700 123 456"
                          />
                        ) : (
                          <p className="font-medium">{userDetails.phone || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                        <p className="font-medium">December 2024</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Delivery Address
                      </CardTitle>
                      <CardDescription>Your default delivery address</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Street Address</label>
                        {isEditing ? (
                          <Textarea
                            value={userDetails.address}
                            onChange={(e) => setUserDetails({...userDetails, address: e.target.value})}
                            rows={2}
                            placeholder="123 Main Street"
                          />
                        ) : (
                          <p className="font-medium">{userDetails.address || 'Not provided'}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">City</label>
                          {isEditing ? (
                            <Input
                              value={userDetails.city}
                              onChange={(e) => setUserDetails({...userDetails, city: e.target.value})}
                              placeholder="Nairobi"
                            />
                          ) : (
                            <p className="font-medium">{userDetails.city || 'Not provided'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Postal Code</label>
                          {isEditing ? (
                            <Input
                              value={userDetails.postalCode}
                              onChange={(e) => setUserDetails({...userDetails, postalCode: e.target.value})}
                              placeholder="00100"
                            />
                          ) : (
                            <p className="font-medium">{userDetails.postalCode || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{isAdmin ? 'All Orders' : 'Your Order History'}</CardTitle>
                    <CardDescription>
                      {isAdmin ? 'Manage all customer orders' : 'Track your magnet orders and delivery status'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          {isAdmin && <TableHead>Customer</TableHead>}
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(isAdmin ? allOrders : orders).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            {isAdmin && <TableCell>{order.customer}</TableCell>}
                            <TableCell>{order.items}</TableCell>
                            <TableCell>KSh {order.total.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell>{order.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admin Dashboard Components */}
              {isAdmin && (
                <AdminDashboard 
                  allUsers={allUsers}
                  allOrders={allOrders}
                  getStatusColor={getStatusColor}
                />
              )}
            </Tabs>

            {!isAdmin && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks you might want to perform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <Button onClick={() => navigate('/')} variant="outline" className="h-auto py-4 flex flex-col">
                      <ShoppingBag className="h-8 w-8 mb-2" />
                      <span>Shop Magnets</span>
                    </Button>
                    <Button onClick={() => navigate('/cart')} variant="outline" className="h-auto py-4 flex flex-col">
                      <Star className="h-8 w-8 mb-2" />
                      <span>View Cart</span>
                    </Button>
                    <Button onClick={() => navigate('/contact')} variant="outline" className="h-auto py-4 flex flex-col">
                      <User className="h-8 w-8 mb-2" />
                      <span>Contact Us</span>
                    </Button>
                    <Button onClick={() => navigate('/about')} variant="outline" className="h-auto py-4 flex flex-col">
                      <Settings className="h-8 w-8 mb-2" />
                      <span>About Us</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;