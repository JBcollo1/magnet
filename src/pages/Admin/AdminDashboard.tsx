// frontend/magnet/src/pages/Admin/AdminDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, DollarSign, Package, Users, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Import the sub-components that will be rendered inside tabs
import AdminOrder from './AdminOrder';
import AdminPayment from './AdminPayment';
import AdminPickupPoint from './AdminPickupPoint';
import AdminProduct from './AdminProduct';
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
    order_number: string;
    customer_name: string;
    notes?: string; // Add notes as it's used in AdminOrder for editing
}

// NEW: Interface for the paginated order response
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

interface PickupPoint {
    id: string;
    name: string;
    address: string;
    city: string;
    contactPerson: string;
    contactPhone: string;
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
    const [ordersPagination, setOrdersPagination] = useState({ total: 0, pages: 1, current_page: 1 }); // NEW State for pagination
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allPickupPoints, setAllPickupPoints] = useState<PickupPoint[]>([]);

    const [dataLoading, setDataLoading] = useState(true);

    const isAdmin = (user as AppUser)?.role === 'ADMIN';

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        } else if (!authLoading && isAuthenticated && !isAdmin) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, authLoading, navigate, isAdmin]);

    // NEW: currentPage state for orders (to be passed to AdminOrder)
    const [currentOrdersPage, setCurrentOrdersPage] = useState(1);

    const fetchAdminData = async (page: number = 1) => { // Modified to accept a page parameter
        if (!isAdmin) return;

        setDataLoading(true); // Moved here to cover all fetches
        try {
            const [usersResponse, ordersResponse, productsResponse, pickupPointsResponse] = await Promise.all([
                axios.get<UserData[]>(`${import.meta.env.VITE_API_URL}/admin/users`, { withCredentials: true }),
                // UPDATED: Expecting PaginatedOrdersResponse
                axios.get<PaginatedOrdersResponse>(`${import.meta.env.VITE_API_URL}/admin/orders?page=${page}`, { withCredentials: true }),
                axios.get<Product[]>(`${import.meta.env.VITE_API_URL}/admin/products`, { withCredentials: true }),
                axios.get<PickupPoint[]>(`${import.meta.env.VITE_API_URL}/admin/pickup-points`, { withCredentials: true })
            ]);

            const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
            // UPDATED: Extract orders and pagination info
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
            setOrdersPagination(ordersPaginationData); // Set pagination state
            setAllProducts(productsData);
            setAllPickupPoints(pickupPointsData);

        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            // Updated fallback data to include the missing properties and new types
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
            // UPDATED: Fallback for orders needs to match PaginatedOrdersResponse
            setAllOrders([
                { id: 'ORD-001', order_number: 'ORD-001', customer_name: 'John Doe', customer: 'John Doe', items: '4-CUSTOM MAGNETS', total: 800, status: 'delivered', date: '2024-12-01', paymentMethod: 'M-Pesa', notes: '' },
                { id: 'ORD-002', order_number: 'ORD-002', customer_name: 'Jane Smith', customer: 'Jane Smith', items: '6-CUSTOM MAGNETS', total: 1200, status: 'pending', date: '2024-12-15', paymentMethod: 'M-Pesa', notes: '' },
                { id: 'ORD-003', order_number: 'ORD-003', customer_name: 'Mike Johnson', customer: 'Mike Johnson', items: '12-CUSTOM MAGNETS', total: 2200, status: 'shipped', date: '2024-12-10', paymentMethod: 'M-Pesa', notes: '' },
                { id: 'ORD-004', order_number: 'ORD-004', customer_name: 'Mike Johnson', customer: 'Mike Johnson', items: '9-CUSTOM MAGNETS', total: 1700, status: 'delivered', date: '2024-11-28', paymentMethod: 'M-Pesa', notes: '' }
            ]);
            setOrdersPagination({ total: 4, pages: 1, current_page: 1 }); // Fallback pagination
            setAllProducts([
                { id: 'PROD-001', name: 'Standard Magnet', description: 'Classic custom magnet', price: 150, stock: 100, imageUrl: '/images/magnet1.jpg' },
                { id: 'PROD-002', name: 'Premium Magnet', description: 'High-quality durable magnet', price: 250, stock: 50, imageUrl: '/images/magnet2.jpg' }
            ]);
            setAllPickupPoints([
                { id: 'PP-001', name: 'CBD Hub', address: 'Ronald Ngala Street, Nairobi', city: 'Nairobi', contactPerson: 'Dan M.', contactPhone: '+254712345678' },
                { id: 'PP-002', name: 'Westlands Collection', address: 'Waiyaki Way, Westlands', city: 'Nairobi', contactPerson: 'Alice K.', contactPhone: '+254723456789' }
            ]);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (user && isAdmin) {
            fetchAdminData(currentOrdersPage); // Fetch data for the current page
        }
    }, [user, isAdmin, currentOrdersPage]); // Depend on currentOrdersPage

    // Derived statistics for overview
    const totalRevenue = useMemo(() => {
        return allOrders.reduce((sum, order) => sum + order.total, 0);
    }, [allOrders]);

    const totalOrders = ordersPagination.total; // Use total from pagination
    const totalCustomers = allUsers.filter(u => u.role === 'CUSTOMER').length;
    const totalProducts = allProducts.length;

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
            case 'cancelled': return 'text-red-600 bg-red-100'; // Added for completeness
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

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                        <TabsTrigger value="pickup-points">Pickup Points</TabsTrigger>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="reports">System Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">KSh {totalRevenue.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Customers</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">+19% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Products</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">Total unique products</p>
                                </CardContent>
                            </Card>
                        </div>

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
                                                    <p className="font-medium">{order.order_number}</p>
                                                    <p className="text-sm text-gray-600">{order.customer_name}</p>
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
                                            .filter(u => u.role === 'CUSTOMER')
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
                        {/* Pass pagination props to AdminOrder */}
                        <AdminOrder
                            allOrders={allOrders}
                            fetchAdminData={fetchAdminData} // This function now accepts a page number
                            // getStatusColor={getStatusColor}
                            totalOrders={ordersPagination.total} // NEW
                            totalPages={ordersPagination.pages} // NEW
                            currentPage={ordersPagination.current_page} // NEW
                            onPageChange={setCurrentOrdersPage} // NEW
                        />
                    </TabsContent>

                    <TabsContent value="products" className="space-y-6">
                        <AdminProduct allProducts={allProducts} fetchAdminData={() => fetchAdminData()} /> {/* Wrap fetchAdminData for other components */}
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-6">
                        <AdminPayment allOrders={allOrders} fetchAdminData={() => fetchAdminData()} />
                    </TabsContent>

                    <TabsContent value="pickup-points" className="space-y-6">
                        <AdminPickupPoint allPickupPoints={allPickupPoints} fetchAdminData={() => fetchAdminData()} />
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