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
import {
  User,
  ShoppingBag,
  Star,
  Settings,
  MapPin,
  Edit,
  Save,
  Package,
  Loader2,
  Heart,
  Gift
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: string;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
}

interface UserDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  dateJoined?: string;
}

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
}

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    dateJoined: 'December 2024'
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const totalItemsInCart = cartItems?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const recentOrders = orders.slice(0, 3);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if ((user as AppUser)?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        setUserDetails(prev => ({
          ...prev,
          name: user?.name || '',
          email: user?.email || '',
        }));
        const loadData = async () => {
          setDataLoading(true);
          try {
            await Promise.all([
              fetchUserProfile(),
              fetchUserOrders()
            ]);
          } finally {
            setDataLoading(false);
          }
        };
        loadData();
      }
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const fetchUserProfile = async () => {
    if ((user as AppUser)?.role !== 'ADMIN') {
      try {
        const response = await axios.get<UserDetails>(
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
    }
  };

  const fetchUserOrders = async () => {
    if ((user as AppUser)?.role !== 'ADMIN') {
      try {
        const response = await axios.get<Order[]>(
          `${import.meta.env.VITE_API_URL}/orders`,
          { withCredentials: true }
        );

        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([
          {
            id: 'ORD-001',
            date: '2024-12-01',
            items: '4-CUSTOM MAGNETS',
            total: 800,
            status: 'Delivered',
            paymentMethod: 'M-Pesa',
            trackingNumber: 'TRK001234',
            estimatedDelivery: '2024-12-05'
          },
          {
            id: 'ORD-002',
            date: '2024-12-15',
            items: '6-CUSTOM MAGNETS',
            total: 1200,
            status: 'Processing',
            paymentMethod: 'M-Pesa',
            trackingNumber: 'TRK001235',
            estimatedDelivery: '2024-12-20'
          },
          {
            id: 'ORD-003',
            date: '2024-11-28',
            items: '2-CUSTOM MAGNETS',
            total: 400,
            status: 'Shipped',
            paymentMethod: 'Card',
            trackingNumber: 'TRK001236',
            estimatedDelivery: '2024-12-02'
          }
        ]);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-900 dark:text-gray-100" />
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user as AppUser).role === 'ADMIN') {
    return null;
  }

  const handleSaveDetails = async () => {
    setLoading(true);
    try {
      await axios.put<ApiResponse<UserDetails>>(
        `${import.meta.env.VITE_API_URL}/profile/details`,
        userDetails,
        { withCredentials: true }
      );

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
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'shipped': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'processing':
      case 'pending': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const CustomerOverviewCards = () => (
    <>
      <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Cart Items</CardTitle>
          <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalItemsInCart}</div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Items ready to order</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-gray-500 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{orders.length}</div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Orders completed</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Spent</CardTitle>
          <Star className="h-4 w-4 text-gray-500 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            KSh {totalSpent.toLocaleString()}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Lifetime value</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Account Status</CardTitle>
          <User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">Active</div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Member since {userDetails.dateJoined}</p>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account, track your magnet orders, and explore our latest designs.
          </p>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2 text-gray-900 dark:text-gray-100" />
            <span className="text-gray-700 dark:text-gray-300">Loading your dashboard...</span>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <CustomerOverviewCards />
            </div>

            {/* Recent Orders Preview */}
            {recentOrders.length > 0 && (
              <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Recent Orders</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Your latest magnet orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-lg text-gray-900 dark:text-gray-100">{order.id}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{order.items}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg text-gray-900 dark:text-gray-100">KSh {order.total.toLocaleString()}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500">My Profile</TabsTrigger>
                <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500">Order History</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-gray-900 dark:text-gray-100">Personal Information</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-300">Your account details and contact information</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => isEditing ? handleSaveDetails() : setIsEditing(true)}
                          disabled={loading}
                          className="bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-900 dark:text-gray-100" />
                          ) : isEditing ? (
                            <Save className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
                          ) : (
                            <Edit className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
                          )}
                          {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
                          {isEditing ? (
                            <Input
                              value={userDetails.name}
                              onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.name}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                          {isEditing ? (
                            <Input
                              value={userDetails.email}
                              onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.email}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                        {isEditing ? (
                          <Input
                            value={userDetails.phone}
                            onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                            placeholder="+254 700 123 456"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.phone || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</Label>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.dateJoined}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <MapPin className="w-5 h-5 mr-2 text-gray-900 dark:text-gray-100" />
                        Delivery Address
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">Your default delivery address for orders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</Label>
                        {isEditing ? (
                          <Textarea
                            value={userDetails.address}
                            onChange={(e) => setUserDetails({...userDetails, address: e.target.value})}
                            rows={2}
                            placeholder="123 Main Street, Apartment 4B"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.address || 'Not provided'}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</Label>
                          {isEditing ? (
                            <Input
                              value={userDetails.city}
                              onChange={(e) => setUserDetails({...userDetails, city: e.target.value})}
                              placeholder="Nairobi"
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.city || 'Not provided'}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</Label>
                          {isEditing ? (
                            <Input
                              value={userDetails.postalCode}
                              onChange={(e) => setUserDetails({...userDetails, postalCode: e.target.value})}
                              placeholder="00100"
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.postalCode || 'Not provided'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Your Order History</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Track your magnet orders and delivery status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-gray-900 dark:text-gray-100">Order ID</TableHead>
                            <TableHead className="text-gray-900 dark:text-gray-100">Items</TableHead>
                            <TableHead className="text-gray-900 dark:text-gray-100">Total</TableHead>
                            <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
                            <TableHead className="text-gray-900 dark:text-gray-100">Date</TableHead>
                            <TableHead className="text-gray-900 dark:text-gray-100">Payment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{order.id}</TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">{order.items}</TableCell>
                              <TableCell className="font-medium text-green-600 dark:text-green-400">KSh {order.total.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">{order.date}</TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">{order.paymentMethod}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 dark:text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-300">No orders yet. Start shopping to see your order history!</p>
                        <Button onClick={() => navigate('/')} className="mt-4 bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">
                          Browse Magnets
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-gray-100">Account Preferences</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">Manage your account settings and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-300">Receive updates about your orders</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Marketing Emails</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-300">Get notified about new designs and offers</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">SMS Updates</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-300">Receive SMS updates for order status</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-gray-100">Account Actions</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">Manage your account security and data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full justify-start bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">
                        <Edit className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">
                        <Package className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
                        Download Order History
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">
                        <User className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
                        Delete Account
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <Card className="mt-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Common tasks and helpful links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button onClick={() => navigate('/')} variant="outline" className="h-auto py-4 flex flex-col hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-white dark:bg-gray-800 dark:text-gray-100">
                    <ShoppingBag className="h-8 w-8 mb-2 text-purple-600 dark:text-purple-400" />
                    <span>Shop Magnets</span>
                  </Button>
                  <Button onClick={() => navigate('/cart')} variant="outline" className="h-auto py-4 flex flex-col hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-gray-800 dark:text-gray-100">
                    <Star className="h-8 w-8 mb-2 text-blue-600 dark:text-blue-400" />
                    <span>View Cart ({totalItemsInCart})</span>
                  </Button>
                  <Button onClick={() => navigate('/contact')} variant="outline" className="h-auto py-4 flex flex-col hover:bg-green-50 dark:hover:bg-green-900/20 bg-white dark:bg-gray-800 dark:text-gray-100">
                    <Heart className="h-8 w-8 mb-2 text-green-600 dark:text-green-400" />
                    <span>Contact Support</span>
                  </Button>
                  <Button onClick={() => navigate('/about')} variant="outline" className="h-auto py-4 flex flex-col hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-white dark:bg-gray-800 dark:text-gray-100">
                    <Gift className="h-8 w-8 mb-2 text-orange-600 dark:text-orange-400" />
                    <span>Gift Cards</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
