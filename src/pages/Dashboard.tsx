// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Header from '@/components/Header';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useAuth } from '@/contexts/AuthContext';
// import { useCart } from '@/contexts/CartContext';
// import { User, ShoppingBag, Star, Settings, MapPin, Edit, Save, Package, Loader2, TrendingUp, Users, DollarSign } from 'lucide-react';
// import { toast } from '@/hooks/use-toast';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
// import { Label } from '@/components/ui/label';

// interface Order {
//   id: string;
//   date: string;
//   items: string;
//   total: number;
//   status: string;
//   paymentMethod: string;
//   customer?: string;
// }

// interface UserData {
//   id: string;
//   name: string;
//   email: string;
//   orders: number;
//   totalSpent: number;
// }

// interface AppUser {
//   id: string;
//   name: string;
//   email: string;
//   role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
// }

// interface UserDetails {
//   name: string;
//   email: string;
//   phone: string;
//   address: string;
//   city: string;
//   postalCode: string;
// }

// interface ApiResponse<T> {
//   data?: T;
//   success?: boolean;
//   message?: string;
// }

// interface UserAdmin {
//   id: string;
//   name: string;
//   email: string;
//   role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
// }

// interface AdminOverviewCardsProps {
//   allOrders: Order[];
//   totalItemsInCart: number;
// }

// interface AdminDashboardProps {
//   allUsers: UserData[];
//   allOrders: Order[];
//   getStatusColor: (status: string) => string;
// }

// const AdminOverviewCards: React.FC<AdminOverviewCardsProps> = ({ allOrders, totalItemsInCart }) => {
//   const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
//   const totalCustomers = allOrders.reduce((acc, order) => {
//     if (order.customer && !acc.includes(order.customer)) {
//       acc.push(order.customer);
//     }
//     return acc;
//   }, [] as string[]).length;

//   return (
//     <>
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//           <DollarSign className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-green-600">
//             KSh {totalRevenue.toLocaleString()}
//           </div>
//           <p className="text-xs text-muted-foreground">All time revenue</p>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//           <Package className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-blue-600">{allOrders.length}</div>
//           <p className="text-xs text-muted-foreground">All orders</p>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
//           <Users className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-purple-600">{totalCustomers}</div>
//           <p className="text-xs text-muted-foreground">Unique customers</p>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Average Order</CardTitle>
//           <TrendingUp className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-orange-600">
//             KSh {allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length).toLocaleString() : '0'}
//           </div>
//           <p className="text-xs text-muted-foreground">Per order value</p>
//         </CardContent>
//       </Card>
//     </>
//   );
// };

// const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsers, allOrders, getStatusColor }) => {
//   const recentOrders = allOrders.slice(0, 5);
//   const topCustomers = allUsers
//     .sort((a, b) => b.totalSpent - a.totalSpent)
//     .slice(0, 5);

//   return (
//     <div className="space-y-6">
//       <div className="grid lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Orders</CardTitle>
//             <CardDescription>Latest customer orders</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {recentOrders.map((order) => (
//                 <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                   <div className="flex-1">
//                     <p className="font-medium">{order.id}</p>
//                     <p className="text-sm text-gray-600">{order.customer}</p>
//                     <p className="text-xs text-gray-500">{order.items}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium">KSh {order.total.toLocaleString()}</p>
//                     <Badge className={getStatusColor(order.status)}>
//                       {order.status}
//                     </Badge>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Top Customers</CardTitle>
//             <CardDescription>Highest spending customers</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {topCustomers.map((customer, index) => (
//                 <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
//                       <span className="text-sm font-medium text-purple-600">#{index + 1}</span>
//                     </div>
//                     <div>
//                       <p className="font-medium">{customer.name}</p>
//                       <p className="text-sm text-gray-600">{customer.email}</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium">KSh {customer.totalSpent.toLocaleString()}</p>
//                     <p className="text-xs text-gray-500">{customer.orders} orders</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Order Status Overview</CardTitle>
//           <CardDescription>Current status of all orders</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid md:grid-cols-4 gap-4">
//             {['delivered', 'shipped', 'processing', 'pending'].map((status) => {
//               const count = allOrders.filter(order => order.status.toLowerCase() === status).length;
//               return (
//                 <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
//                   <div className="text-2xl font-bold">{count}</div>
//                   <div className="text-sm text-gray-600 capitalize">{status}</div>
//                 </div>
//               );
//             })}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// const Dashboard = () => {
//   const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
//   const { cartItems } = useCart();
//   const navigate = useNavigate();

//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [userDetails, setUserDetails] = useState<UserDetails>({
//     name: user?.name || '',
//     email: user?.email || '',
//     phone: '',
//     address: '',
//     city: '',
//     postalCode: ''
//   });

//   const [orders, setOrders] = useState<Order[]>([]);
//   const [allUsers, setAllUsers] = useState<UserData[]>([]);
//   const [allOrders, setAllOrders] = useState<Order[]>([]);
//   const [dataLoading, setDataLoading] = useState(true);

//   const totalItemsInCart = cartItems?.reduce((total, item) => total + item.quantity, 0) ?? 0;
//   const isAdmin = (user as AppUser)?.role === 'ADMIN';

//   useEffect(() => {
//     if (user) {
//       setUserDetails(prev => ({
//         ...prev,
//         name: user.name || '',
//         email: user.email || '',
//       }));
//     }
//   }, [user]);

//   useEffect(() => {
//     if (!authLoading && !isAuthenticated) {
//       navigate('/login');
//     }
//   }, [isAuthenticated, authLoading, navigate]);

//   const fetchUserProfile = async () => {
//     try {
//       const response = await axios.get<UserDetails>(
//         `${import.meta.env.VITE_API_URL}/profile/details`,
//         { withCredentials: true }
//       );

//       if (response.data) {
//         setUserDetails(prev => ({
//           ...prev,
//           ...response.data
//         }));
//       }
//     } catch (error) {
//       console.error('Failed to fetch user profile:', error);
//     }
//   };

//   const fetchUserOrders = async () => {
//     try {
//       const response = await axios.get<Order[]>(
//         `${import.meta.env.VITE_API_URL}/orders`,
//         { withCredentials: true }
//       );

//       const ordersData = Array.isArray(response.data) ? response.data : [];
//       setOrders(ordersData);
//     } catch (error) {
//       console.error('Failed to fetch orders:', error);
//       setOrders([
//         {
//           id: 'ORD-001',
//           date: '2024-12-01',
//           items: '4-CUSTOM MAGNETS',
//           total: 800,
//           status: 'Delivered',
//           paymentMethod: 'M-Pesa'
//         },
//         {
//           id: 'ORD-002',
//           date: '2024-12-15',
//           items: '6-CUSTOM MAGNETS',
//           total: 1200,
//           status: 'Processing',
//           paymentMethod: 'M-Pesa'
//         }
//       ]);
//     }
//   };

//   const fetchAdminData = async () => {
//     if (!isAdmin) return;

//     try {
//       const [usersResponse, ordersResponse] = await Promise.all([
//         axios.get<UserData[]>(`${import.meta.env.VITE_API_URL}/admin/users`, { withCredentials: true }),
//         axios.get<Order[]>(`${import.meta.env.VITE_API_URL}/admin/orders`, { withCredentials: true })
//       ]);

//       const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
//       const ordersData = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];

//       setAllUsers(usersData);
//       setAllOrders(ordersData);
//     } catch (error) {
//       console.error('Failed to fetch admin data:', error);
//       setAllUsers([
//         { id: '1', name: 'John Doe', email: 'john@example.com', orders: 3, totalSpent: 2400 },
//         { id: '2', name: 'Jane Smith', email: 'jane@example.com', orders: 1, totalSpent: 800 },
//         { id: '3', name: 'Mike Johnson', email: 'mike@example.com', orders: 2, totalSpent: 2900 }
//       ]);
//       setAllOrders([
//         { id: 'ORD-001', customer: 'John Doe', items: '4-CUSTOM MAGNETS', total: 800, status: 'delivered', date: '2024-12-01', paymentMethod: 'M-Pesa' },
//         { id: 'ORD-002', customer: 'Jane Smith', items: '6-CUSTOM MAGNETS', total: 1200, status: 'pending', date: '2024-12-15', paymentMethod: 'M-Pesa' },
//         { id: 'ORD-003', customer: 'Mike Johnson', items: '12-CUSTOM MAGNETS', total: 2200, status: 'shipped', date: '2024-12-10', paymentMethod: 'M-Pesa' },
//         { id: 'ORD-004', customer: 'Mike Johnson', items: '9-CUSTOM MAGNETS', total: 1700, status: 'delivered', date: '2024-11-28', paymentMethod: 'M-Pesa' }
//       ]);
//     }
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       if (!user) return;

//       setDataLoading(true);
//       try {
//         await Promise.all([
//           fetchUserProfile(),
//           fetchUserOrders(),
//           fetchAdminData()
//         ]);
//       } finally {
//         setDataLoading(false);
//       }
//     };

//     loadData();
//   }, [user, isAdmin]);

//   if (authLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
//           <p>Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated || !user) {
//     return null;
//   }

//   const handleSaveDetails = async () => {
//     setLoading(true);
//     try {
//       await axios.put<ApiResponse<UserDetails>>(
//         `${import.meta.env.VITE_API_URL}/profile/details`,
//         userDetails,
//         { withCredentials: true }
//       );

//       await refreshUser();

//       setIsEditing(false);
//       toast({
//         title: "Details updated",
//         description: "Your profile has been updated successfully.",
//       });
//     } catch (error) {
//       console.error('Failed to update profile:', error);
//       toast({
//         title: "Update failed",
//         description: "Failed to update your profile. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'delivered': return 'text-green-600 bg-green-100';
//       case 'shipped': return 'text-blue-600 bg-blue-100';
//       case 'processing':
//       case 'pending': return 'text-orange-600 bg-orange-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   const UserOverviewCards = () => (
//     <>
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
//           <ShoppingBag className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-purple-600">{totalItemsInCart}</div>
//           <p className="text-xs text-muted-foreground">Items in your cart</p>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//           <Package className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
//           <p className="text-xs text-muted-foreground">Your orders</p>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
//           <Star className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-green-600">
//             KSh {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
//           </div>
//           <p className="text-xs text-muted-foreground">Total value</p>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Account Status</CardTitle>
//           <User className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-green-600">Active</div>
//           <p className="text-xs text-muted-foreground">Account standing</p>
//         </CardContent>
//       </Card>
//     </>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background">
//       <Header />

//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
//           <p className="text-gray-600">
//             {isAdmin ? 'Admin Dashboard - Manage your magnet business' : 'Manage your account and track your magnet orders.'}
//           </p>
//         </div>

//         {dataLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <Loader2 className="h-8 w-8 animate-spin mr-2" />
//             <span>Loading dashboard data...</span>
//           </div>
//         ) : (
//           <>
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               {isAdmin ? (
//                 <AdminOverviewCards
//                   allOrders={allOrders}
//                   totalItemsInCart={totalItemsInCart}
//                 />
//               ) : (
//                 <UserOverviewCards />
//               )}
//             </div>

//             <Tabs defaultValue={isAdmin ? "overview" : "profile"} className="space-y-6">
//               <TabsList className="grid w-full grid-cols-4">
//                 <TabsTrigger value="profile">My Profile</TabsTrigger>
//                 <TabsTrigger value="orders">Orders</TabsTrigger>
//                 {isAdmin && <TabsTrigger value="users">All Users</TabsTrigger>}
//                 {isAdmin && <TabsTrigger value="overview">Admin Overview</TabsTrigger>}
//               </TabsList>

//               <TabsContent value="profile" className="space-y-6">
//                 <div className="grid lg:grid-cols-2 gap-8">
//                   <Card>
//                     <CardHeader>
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <CardTitle>Personal Information</CardTitle>
//                           <CardDescription>Your account details and contact information</CardDescription>
//                         </div>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => isEditing ? handleSaveDetails() : setIsEditing(true)}
//                           disabled={loading}
//                         >
//                           {loading ? (
//                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           ) : isEditing ? (
//                             <Save className="w-4 h-4 mr-2" />
//                           ) : (
//                             <Edit className="w-4 h-4 mr-2" />
//                           )}
//                           {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
//                         </Button>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label className="text-sm font-medium text-gray-500">Full Name</Label>
//                           {isEditing ? (
//                             <Input
//                               value={userDetails.name}
//                               onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
//                             />
//                           ) : (
//                             <p className="font-medium">{userDetails.name}</p>
//                           )}
//                         </div>
//                         <div>
//                           <Label className="text-sm font-medium text-gray-500">Email</Label>
//                           {isEditing ? (
//                             <Input
//                               value={userDetails.email}
//                               onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
//                             />
//                           ) : (
//                             <p className="font-medium">{userDetails.email}</p>
//                           )}
//                         </div>
//                       </div>
//                       <div>
//                         <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
//                         {isEditing ? (
//                           <Input
//                             value={userDetails.phone}
//                             onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
//                             placeholder="+254 700 123 456"
//                           />
//                         ) : (
//                           <p className="font-medium">{userDetails.phone || 'Not provided'}</p>
//                         )}
//                       </div>
//                       <div>
//                         <Label className="text-sm font-medium text-gray-500">Member Since</Label>
//                         <p className="font-medium">December 2024</p>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center">
//                         <MapPin className="w-5 h-5 mr-2" />
//                         Delivery Address
//                       </CardTitle>
//                       <CardDescription>Your default delivery address</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div>
//                         <Label className="text-sm font-medium text-gray-500">Street Address</Label>
//                         {isEditing ? (
//                           <Textarea
//                             value={userDetails.address}
//                             onChange={(e) => setUserDetails({...userDetails, address: e.target.value})}
//                             rows={2}
//                             placeholder="123 Main Street"
//                           />
//                         ) : (
//                           <p className="font-medium">{userDetails.address || 'Not provided'}</p>
//                         )}
//                       </div>
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label className="text-sm font-medium text-gray-500">City</Label>
//                           {isEditing ? (
//                             <Input
//                               value={userDetails.city}
//                               onChange={(e) => setUserDetails({...userDetails, city: e.target.value})}
//                               placeholder="Nairobi"
//                             />
//                           ) : (
//                             <p className="font-medium">{userDetails.city || 'Not provided'}</p>
//                           )}
//                         </div>
//                         <div>
//                           <Label className="text-sm font-medium text-gray-500">Postal Code</Label>
//                           {isEditing ? (
//                             <Input
//                               value={userDetails.postalCode}
//                               onChange={(e) => setUserDetails({...userDetails, postalCode: e.target.value})}
//                               placeholder="00100"
//                             />
//                           ) : (
//                             <p className="font-medium">{userDetails.postalCode || 'Not provided'}</p>
//                           )}
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </TabsContent>

//               <TabsContent value="orders" className="space-y-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>{isAdmin ? 'All Orders' : 'Your Order History'}</CardTitle>
//                     <CardDescription>
//                       {isAdmin ? 'Manage all customer orders' : 'Track your magnet orders and delivery status'}
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Order ID</TableHead>
//                           {isAdmin && <TableHead>Customer</TableHead>}
//                           <TableHead>Items</TableHead>
//                           <TableHead>Total</TableHead>
//                           <TableHead>Status</TableHead>
//                           <TableHead>Date</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {(isAdmin ? allOrders : orders).map((order) => (
//                           <TableRow key={order.id}>
//                             <TableCell className="font-medium">{order.id}</TableCell>
//                             {isAdmin && <TableCell>{order.customer}</TableCell>}
//                             <TableCell>{order.items}</TableCell>
//                             <TableCell>KSh {order.total.toLocaleString()}</TableCell>
//                             <TableCell>
//                               <Badge className={getStatusColor(order.status)}>
//                                 {order.status}
//                               </Badge>
//                             </TableCell>
//                             <TableCell>{order.date}</TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               {isAdmin && (
//                 <TabsContent value="overview">
//                   <AdminDashboard
//                     allUsers={allUsers}
//                     allOrders={allOrders}
//                     getStatusColor={getStatusColor}
//                   />
//                 </TabsContent>
//               )}

//               {isAdmin && (
//                 <TabsContent value="users" className="space-y-6">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center">
//                         <User className="w-5 h-5 mr-2" />
//                         User Management
//                       </CardTitle>
//                       <CardDescription>Manage all registered users</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>Name</TableHead>
//                             <TableHead>Email</TableHead>
//                             <TableHead>Total Orders</TableHead>
//                             <TableHead>Total Spent</TableHead>
//                             <TableHead>Actions</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {allUsers.map((user) => (
//                             <TableRow key={user.id}>
//                               <TableCell className="font-medium">{user.name}</TableCell>
//                               <TableCell>{user.email}</TableCell>
//                               <TableCell>{user.orders}</TableCell>
//                               <TableCell>KSh {user.totalSpent.toLocaleString()}</TableCell>
//                               <TableCell>
//                                 <Button variant="outline" size="sm">
//                                   View Details
//                                 </Button>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               )}
//             </Tabs>

//             {!isAdmin && (
//               <Card className="mt-8">
//                 <CardHeader>
//                   <CardTitle>Quick Actions</CardTitle>
//                   <CardDescription>Common tasks you might want to perform</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid md:grid-cols-4 gap-4">
//                     <Button onClick={() => navigate('/')} variant="outline" className="h-auto py-4 flex flex-col">
//                       <ShoppingBag className="h-8 w-8 mb-2" />
//                       <span>Shop Magnets</span>
//                     </Button>
//                     <Button onClick={() => navigate('/cart')} variant="outline" className="h-auto py-4 flex flex-col">
//                       <Star className="h-8 w-8 mb-2" />
//                       <span>View Cart</span>
//                     </Button>
//                     <Button onClick={() => navigate('/contact')} variant="outline" className="h-auto py-4 flex flex-col">
//                       <User className="h-8 w-8 mb-2" />
//                       <span>Contact Us</span>
//                     </Button>
//                     <Button onClick={() => navigate('/about')} variant="outline" className="h-auto py-4 flex flex-col">
//                       <Settings className="h-8 w-8 mb-2" />
//                       <span>About Us</span>
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

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
import { User, ShoppingBag, Star, Settings, MapPin, Edit, Save, Package, Loader2, Heart, Gift } from 'lucide-react';
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
    if (user) {
      setUserDetails(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchUserProfile = async () => {
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
  };

  const fetchUserOrders = async () => {
    try {
      const response = await axios.get<Order[]>(
        `${import.meta.env.VITE_API_URL}/orders`,
        { withCredentials: true }
      );

      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Fallback demo data
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
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

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
  }, [user]);

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

  if (!isAuthenticated || !user) {
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
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing':
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const CustomerOverviewCards = () => (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{totalItemsInCart}</div>
          <p className="text-xs text-muted-foreground">Items ready to order</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
          <p className="text-xs text-muted-foreground">Orders completed</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            KSh {totalSpent.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Lifetime value</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Status</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Active</div>
          <p className="text-xs text-muted-foreground">Member since {userDetails.dateJoined}</p>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 dark:bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600">
            Manage your account, track your magnet orders, and explore our latest designs.
          </p>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading your dashboard...</span>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <CustomerOverviewCards />
            </div>

            {/* Recent Orders Preview */}
            {recentOrders.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your latest magnet orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.items}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">KSh {order.total.toLocaleString()}</p>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">My Profile</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
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
                          <Label className="text-sm font-medium text-gray-500">Full Name</Label>
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
                          <Label className="text-sm font-medium text-gray-500">Email</Label>
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
                        <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
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
                        <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                        <p className="font-medium">{userDetails.dateJoined}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Delivery Address
                      </CardTitle>
                      <CardDescription>Your default delivery address for orders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Street Address</Label>
                        {isEditing ? (
                          <Textarea
                            value={userDetails.address}
                            onChange={(e) => setUserDetails({...userDetails, address: e.target.value})}
                            rows={2}
                            placeholder="123 Main Street, Apartment 4B"
                          />
                        ) : (
                          <p className="font-medium">{userDetails.address || 'Not provided'}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">City</Label>
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
                          <Label className="text-sm font-medium text-gray-500">Postal Code</Label>
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
                    <CardTitle>Your Order History</CardTitle>
                    <CardDescription>
                      Track your magnet orders and delivery status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Payment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell>{order.items}</TableCell>
                              <TableCell className="font-medium">KSh {order.total.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{order.date}</TableCell>
                              <TableCell>{order.paymentMethod}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No orders yet. Start shopping to see your order history!</p>
                        <Button onClick={() => navigate('/')} className="mt-4">
                          Browse Magnets
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Preferences</CardTitle>
                      <CardDescription>Manage your account settings and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Email Notifications</Label>
                          <p className="text-xs text-gray-500">Receive updates about your orders</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Marketing Emails</Label>
                          <p className="text-xs text-gray-500">Get notified about new designs and offers</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">SMS Updates</Label>
                          <p className="text-xs text-gray-500">Receive SMS updates for order status</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Account Actions</CardTitle>
                      <CardDescription>Manage your account security and data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <Edit className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Package className="w-4 h-4 mr-2" />
                        Download Order History
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and helpful links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button onClick={() => navigate('/')} variant="outline" className="h-auto py-4 flex flex-col hover:bg-purple-50">
                    <ShoppingBag className="h-8 w-8 mb-2 text-purple-600" />
                    <span>Shop Magnets</span>
                  </Button>
                  <Button onClick={() => navigate('/cart')} variant="outline" className="h-auto py-4 flex flex-col hover:bg-blue-50">
                    <Star className="h-8 w-8 mb-2 text-blue-600" />
                    <span>View Cart ({totalItemsInCart})</span>
                  </Button>
                  <Button onClick={() => navigate('/contact')} variant="outline" className="h-auto py-4 flex flex-col hover:bg-green-50">
                    <Heart className="h-8 w-8 mb-2 text-green-600" />
                    <span>Contact Support</span>
                  </Button>
                  <Button onClick={() => navigate('/about')} variant="outline" className="h-auto py-4 flex flex-col hover:bg-orange-50">
                    <Gift className="h-8 w-8 mb-2 text-orange-600" />
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