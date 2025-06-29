import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, DollarSign, Package, Users, BarChart, Menu, X, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// PickupPoint interface defined locally since './types' does not exist
interface PickupPoint {
  id: string;
  name: string;
  location_details: string;
  city: string;
  is_active: boolean;
  created_at: string;
  updated: string;
  cost: number;
  phone_number: string;
  is_doorstep: boolean;
  delivery_method: string;
  contact_person: string;
}

// Component imports
import AdminOrder from './AdminOrder';
import AdminPayment from './AdminPayment';
import AdminPickupPoint from './AdminPickupPoint';
import AdminProduct from './AdminProduct';
import SystemReports from './SystemReports';
import UserManagement from './UserManagement';
import AdminImage from './AdminImage';

// Keep your original interfaces exactly as they were
interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  custom_images: boolean;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  city: string | null;
  pickup_point_id: string | null;
  pickup_point: string | null;
  order_notes: string | null;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  order_items: OrderItem[];
}

interface PaginatedOrdersResponse {
  orders: Order[];
  total: number;
  pages: number;
  current_page: number;
}
interface RawProductResponse {
  products: RawProduct[];
  total: number;
  pages: number;
  current_page: number;
}
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

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
interface RawProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;     
  image_url: string;     

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
  const [ordersPagination, setOrdersPagination] = useState({ total: 0, pages: 1, current_page: 1 });
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allPickupPoints, setAllPickupPoints] = useState<PickupPoint[]>([]);

  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = (user as AppUser)?.role === 'ADMIN';

  // Navigation items
  const navItems = [
    { value: 'overview', label: 'Overview', icon: BarChart },
    { value: 'orders', label: 'Orders', icon: Package },
    { value: 'products', label: 'Products', icon: Package },
    { value: 'images', label: 'Custom Images', icon: Image },
    { value: 'payments', label: 'Payments', icon: DollarSign },
    { value: 'pickup-points', label: 'Pickup Points', icon: Package },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'reports', label: 'Reports', icon: BarChart }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate, isAdmin]);

  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);

const fetchAdminData = async (page: number = 1) => {
  if (!isAdmin) return;

  setDataLoading(true);
  
  try {
    const results = await Promise.allSettled([
      axios.get<UserData[]>(`${import.meta.env.VITE_API_URL}/admin/users`, { withCredentials: true }),
      axios.get<PaginatedOrdersResponse>(`${import.meta.env.VITE_API_URL}/admin/orders?page=${page}`, { withCredentials: true }),
      axios.get<RawProductResponse>(`${import.meta.env.VITE_API_URL}/admin/products`, { withCredentials: true }),

      axios.get<PickupPoint[]>(`${import.meta.env.VITE_API_URL}/admin/pickup-points`, { withCredentials: true })
    ]);

    const [usersResult, ordersResult, productsResult, pickupPointsResult] = results;

    // Handle users
    let usersData: UserData[] = [];
    if (usersResult.status === 'fulfilled') {
      usersData = Array.isArray(usersResult.value.data) ? usersResult.value.data : [];
    } else {
      console.error('Failed to fetch users:', usersResult.reason);
      // Mock users data as fallback
      usersData = [
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
        // ... other mock users
      ];
    }

    // Handle orders
    let ordersData: Order[] = [];
    let ordersPaginationData = { total: 0, pages: 1, current_page: 1 };
    if (ordersResult.status === 'fulfilled') {
      ordersData = ordersResult.value.data.orders || [];
      ordersPaginationData = {
        total: ordersResult.value.data.total || 0,
        pages: ordersResult.value.data.pages || 1,
        current_page: ordersResult.value.data.current_page || 1,
      };
    } else {
      console.error('Failed to fetch orders:', ordersResult.reason);
      // Mock orders data as fallback
      ordersData = [
        {
          id: 'ORD-001',
          user_id: 'USER-001',
          order_number: 'ORD-2024-001',
          status: 'pending',
          total_amount: 1500,
          customer_name: 'John Doe',
          customer_phone: '+254712345678',
          delivery_address: 'Nairobi CBD',
          city: 'Nairobi',
          pickup_point_id: 'PP-001',
          pickup_point: 'CBD Hub',
          order_notes: 'Handle with care',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          approved_by: null,
          order_items: [
            {
              id: 'OI-001',
              order_id: 'ORD-001',
              product_id: 'PROD-001',
              product_name: 'Standard Magnet',
              quantity: 10,
              unit_price: 150,
              total_price: 1500,
              custom_images: true,
              created_at: '2024-01-15T10:30:00Z'
            }
          ]
        }
      ];
      ordersPaginationData = { total: ordersData.length, pages: 1, current_page: 1 };
    }

    // Handle products
let productsData: Product[] = [];

if (productsResult.status === 'fulfilled') {
 
  const response = productsResult.value.data;
  const rawProducts = response.products; 
  


  productsData = Array.isArray(rawProducts)
    ? rawProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.quantity,     
        imageUrl: p.image_url  
      }))
    : [];
    
}
else {
  console.error('Failed to fetch products:', productsResult.reason);
  // fallback
  productsData = [
    {
      id: 'PROD-001',
      name: 'Standard Magnet',
      description: 'Classic custom magnet',
      price: 150,
      stock: 100,
      imageUrl: '/images/magnet1.jpg'
    }
  ];
}


    // Handle pickup points
    let pickupPointsData: PickupPoint[] = [];
    if (pickupPointsResult.status === 'fulfilled') {
      pickupPointsData = Array.isArray(pickupPointsResult.value.data) ? pickupPointsResult.value.data : [];
    } else {
      console.error('Failed to fetch pickup points:', pickupPointsResult.reason);
      // Mock pickup points data as fallback
      pickupPointsData = [
        { id: 'PP-001', name: 'CBD Hub', location_details: 'Ronald Ngala Street, Nairobi', city: 'Nairobi', is_active: true, created_at: '2024-01-01', updated: '2024-01-01', cost: 150, phone_number: '+254712345678', is_doorstep: false, delivery_method: 'Standard', contact_person: 'Dan M.' },
        { id: 'PP-002', name: 'Westlands Collection', location_details: 'Waiyaki Way, Westlands', city: 'Nairobi', is_active: true, created_at: '2024-01-02', updated: '2024-01-02', cost: 200, phone_number: '+254723456789', is_doorstep: true, delivery_method: 'Express', contact_person: 'Alice K.' }
      ];
    }

    // Set all data
    setAllUsers(usersData);
    setAllOrders(ordersData);
    setOrdersPagination(ordersPaginationData);
    setAllProducts(productsData);
    setAllPickupPoints(pickupPointsData);

  } finally {
    setDataLoading(false);
  }
};
  useEffect(() => {
    if (user && isAdmin) {
      fetchAdminData(currentOrdersPage);
    }
  }, [user, isAdmin, currentOrdersPage]);

  const totalRevenue = useMemo(() => {
    return allOrders.reduce((sum, order) => sum + order.total_amount, 0);
  }, [allOrders]);

  const totalOrders = ordersPagination.total;
  const totalCustomers = allUsers.filter(u => u.role === 'CUSTOMER').length;
  const totalProducts = allProducts.length;
  console.log('Total Products:', allProducts);
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing':
      case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsMobileMenuOpen(false);
  };

  // Refresh function that maintains current page
  const refreshData = () => {
    fetchAdminData(currentOrdersPage);
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-900 dark:text-gray-100" />
          <p className="text-gray-700 dark:text-gray-300">Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Welcome, Admin {user?.name}!</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your magnet business with ease.
          </p>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {navItems.find(item => item.value === activeTab)?.label}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {isMobileMenuOpen && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    onClick={() => handleTabChange(item.value)}
                    className={`w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      activeTab === item.value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden md:grid w-full grid-cols-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-lg shadow-sm">
            {navItems.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500 text-xs lg:text-sm"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">KSh {totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Orders</CardTitle>
                  <Package className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalOrders.toLocaleString()}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">+180.1% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Customers</CardTitle>
                  <Users className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCustomers.toLocaleString()}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">+19% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Products</CardTitle>
                  <BarChart className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProducts.toLocaleString()}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Total unique products</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Recent Orders</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Latest customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{order.order_number}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{order.customer_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order.order_items.length} items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-gray-100">KSh {order.total_amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Top Customers</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Highest spending customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allUsers
                      .filter(u => u.role === 'CUSTOMER')
                      .sort((a, b) => b.totalSpent - a.totalSpent)
                      .slice(0, 5)
                      .map((customer, index) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-300">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{customer.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">KSh {customer.totalSpent.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{customer.orders} orders</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <AdminOrder
              allOrders={allOrders}
              fetchAdminData={refreshData}
              getStatusColor={getStatusColor}
              totalOrders={ordersPagination.total}
              totalPages={ordersPagination.pages}
              currentPage={ordersPagination.current_page}
              onPageChange={setCurrentOrdersPage}
            />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <AdminProduct allProducts={allProducts} fetchAdminData={refreshData} />
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <AdminImage />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <AdminPayment allOrders={allOrders} fetchAdminData={refreshData} />
          </TabsContent>

          <TabsContent value="pickup-points" className="space-y-6">
            <AdminPickupPoint allPickupPoints={allPickupPoints} fetchAdminData={refreshData} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement allUsers={allUsers} />
          </TabsContent>

          <TabsContent value="reports">
            <SystemReports allOrders={allOrders} getStatusColor={getStatusColor} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;