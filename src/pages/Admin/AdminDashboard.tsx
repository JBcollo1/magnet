import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

import AdminOrder from './AdminOrder';
import AdminPayment from './AdminPayment';
import AdminPickupPoint from './AdminPickupPoint';
import AdminProduct from './AdminProduct';
import SystemReports from './SystemReports';
import UserManagement from './UserManagement';
import AdminImage from './AdminImage';

interface Order {
    id: string;
    date: string;
    items: string;
    total: number;
    status: string;
    paymentMethod: string;
    customer: string; // This might be redundant if customer_name is used
    order_number: string;
    customer_name: string;
    notes?: string;
}

interface PaginatedOrdersResponse {
    orders: Order[];
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
    orders: number; // Assuming this is calculated or provided by backend
    totalSpent: number; // Assuming this is calculated or provided by backend
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
            navigate('/dashboard'); // Redirect non-admins from admin dashboard
        }
    }, [isAuthenticated, authLoading, navigate, isAdmin]);

    // currentOrdersPage is only relevant if AdminDashboard is managing AdminOrder's pagination,
    // which it isn't anymore as AdminOrder handles its own pagination.
    // However, if the Dashboard overview needs paginated orders, this state should remain
    // and fetchAdminData should be called with it for the overview tab.
    const [currentOrdersPageForOverview, setCurrentOrdersPageForOverview] = useState(1);


    const fetchAdminData = useCallback(async (page: number = 1) => {
        if (!isAdmin) return;

        setDataLoading(true);
        try {
            const [usersResponse, ordersResponse, productsResponse, pickupPointsResponse] = await Promise.all([
                axios.get<UserData[]>(`${import.meta.env.VITE_API_URL}/admin/users`, { withCredentials: true }),
                // Fetch only a small set of orders for the overview tab
                axios.get<PaginatedOrdersResponse>(`${import.meta.env.VITE_API_URL}/admin/orders?page=${page}&per_page=5`, { withCredentials: true }),
                axios.get<Product[]>(`${import.meta.env.VITE_API_URL}/admin/products`, { withCredentials: true }),
                axios.get<PickupPoint[]>(`${import.meta.env.VITE_API_URL}/admin/pickup-points`, { withCredentials: true })
            ]);

            const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
            const ordersData = ordersResponse.data.orders;
            const ordersPaginationData = {
                total: ordersResponse.data.total,
                pages: ordersResponse.data.pages,
                current_page: ordersResponse.data.current_page,
            };

            const productsData = Array.isArray(productsResponse.data) ? productsResponse.data : [];
            const pickupPointsData = Array.isArray(pickupPointsResponse.data) ? pickupPointsResponse.data : [];

            setAllUsers(usersData);
            setAllOrders(ordersData);
            setOrdersPagination(ordersPaginationData);
            setAllProducts(productsData);
            setAllPickupPoints(pickupPointsData);

        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            // In a real application, you might want to show a user-friendly error message
            // or redirect to an error page instead of falling back to mock data.
            setAllUsers([]);
            setAllOrders([]);
            setOrdersPagination({ total: 0, pages: 1, current_page: 1 });
            setAllProducts([]);
            setAllPickupPoints([]);
        } finally {
            setDataLoading(false);
        }
    }, [isAdmin]); // Depend only on isAdmin, as page is passed as an argument

    useEffect(() => {
        if (user && isAdmin) {
            fetchAdminData(currentOrdersPageForOverview); // Fetch data for the overview tab
        }
    }, [user, isAdmin, fetchAdminData, currentOrdersPageForOverview]); // Trigger fetch when user/isAdmin changes or overview page changes

    const totalRevenue = useMemo(() => {
        return allOrders.reduce((sum, order) => sum + order.total, 0);
    }, [allOrders]);

    const totalOrders = ordersPagination.total; // This will now reflect the total from the backend
    const totalCustomers = allUsers.filter(u => u.role === 'CUSTOMER').length;
    const totalProducts = allProducts.length;

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
        // When switching tabs, re-fetch data relevant to that tab if it's not managed by child
        // For example, if 'products' tab has its own data fetch, ensure it's triggered.
        // As per current structure, AdminDashboard fetches all data once and passes it.
        // If child components like AdminProduct also fetch, ensure no double fetching or
        // unnecessary prop drilling. For now, we assume AdminDashboard provides all necessary data.
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
        return null; // Or redirect, already handled in useEffect
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
                                    <p className="text-xs text-gray-600 dark:text-gray-300">+20.1% from last month</p> {/* Placeholder, ideally from reports API */}
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Orders</CardTitle>
                                    <Package className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalOrders.toLocaleString()}</div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">+180.1% from last month</p> {/* Placeholder */}
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Customers</CardTitle>
                                    <Users className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCustomers.toLocaleString()}</div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">+19% from last month</p> {/* Placeholder */}
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
                                        {allOrders.map((order) => ( // allOrders now holds the 5 orders for overview
                                            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{order.order_number}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">{order.customer_name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.items}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">KSh {order.total.toLocaleString()}</p>
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                        {allOrders.length === 0 && (
                                            <div className="text-center py-4 text-muted-foreground">No recent orders.</div>
                                        )}
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
                                        {allUsers.filter(u => u.role === 'CUSTOMER').length === 0 && (
                                            <div className="text-center py-4 text-muted-foreground">No customer data available.</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-6">
                        {/* AdminOrder now handles its own data fetching, so no props are needed here */}
                        <AdminOrder />
                    </TabsContent>

                    <TabsContent value="products" className="space-y-6">
                        {/* Assuming AdminProduct also manages its own fetching or takes props */}
                        <AdminProduct allProducts={allProducts} fetchAdminData={() => fetchAdminData(1)} />
                    </TabsContent>

                    <TabsContent value="images" className="space-y-6">
                        <AdminImage />
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-6">
                        <AdminPayment allOrders={allOrders} fetchAdminData={() => fetchAdminData(1)} />
                    </TabsContent>

                    <TabsContent value="pickup-points" className="space-y-6">
                        <AdminPickupPoint allPickupPoints={allPickupPoints} fetchAdminData={() => fetchAdminData(1)} />
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