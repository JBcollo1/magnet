// // frontend/magnet/src/pages/Admin/AdminOrder.tsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { Input } from '@/components/ui/input';
// import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'; // Import Chevron icons

// interface Order {
//     id: string;
//     order_number: string;
//     customer_name: string;
//     items: string;
//     total: number;
//     status: string;
//     paymentMethod: string;
//     date: string;
//     notes?: string;
// }

// interface AdminOrderProps {
//     allOrders: Order[];
//     fetchAdminData: (page?: number) => void; // Modified to accept an optional page number
//     getStatusColor: (status: string) => string;
//     totalOrders: number; // NEW prop: total number of orders (across all pages)
//     totalPages: number; // NEW prop: total number of pages
//     currentPage: number; // NEW prop: current page number
//     onPageChange: (page: number) => void; // NEW prop: function to change page
// }

// const AdminOrder: React.FC<AdminOrderProps> = ({
//     allOrders,
//     fetchAdminData,
//     getStatusColor,
//     totalOrders, // Destructure new props
//     totalPages,
//     currentPage,
//     onPageChange
// }) => {
//     const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//     const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//     const [newStatus, setNewStatus] = useState('');
//     const [orderNotes, setOrderNotes] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

//     useEffect(() => {
//         // Filter locally based on the `allOrders` currently displayed (which are already paginated)
//         setFilteredOrders(
//             allOrders.filter(order =>
//                 order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) || // Allow search by order number
//                 order.items.toLowerCase().includes(searchQuery.toLowerCase()) // Allow search by items
//             )
//         );
//     }, [searchQuery, allOrders]); // Depend on allOrders (the current page's data)

//     const handleEditClick = (order: Order) => {
//         setSelectedOrder(order);
//         setNewStatus(order.status);
//         setOrderNotes(order.notes || '');
//         setIsEditDialogOpen(true);
//     };

//     const handleUpdateOrder = async () => {
//         if (!selectedOrder) return;

//         setLoading(true);
//         try {
//             await axios.put(
//                 `${import.meta.env.VITE_API_URL}/orders/${selectedOrder.id}/status`,
//                 { status: newStatus, order_notes: orderNotes },
//                 { withCredentials: true }
//             );
//             fetchAdminData(currentPage); // Re-fetch current page after update
//             setIsEditDialogOpen(false);
//         } catch (error) {
//             console.error('Failed to update order:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDeleteOrder = async (orderId: string) => {
//         if (window.confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
//             setLoading(true);
//             try {
//                 await axios.delete(`${import.meta.env.VITE_API_URL}/orders/${orderId}`, { withCredentials: true });
//                 fetchAdminData(currentPage); // Re-fetch current page after delete
//             } catch (error) {
//                 console.error('Failed to delete order:', error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//     };

//     const handlePageChange = (page: number) => {
//         if (page >= 1 && page <= totalPages) {
//             onPageChange(page); // Notify parent to fetch data for the new page
//         }
//     };

//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Manage Orders</CardTitle>
//                 <CardDescription>View, update, and manage the status of all customer orders.</CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <div className="mb-4">
//                     <Input
//                         type="text"
//                         placeholder="Search by customer name, order ID or items..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                 </div>
//                 {loading && ( // Show loading indicator during update/delete
//                     <div className="flex justify-center items-center h-48">
//                         <Loader2 className="h-6 w-6 animate-spin" />
//                         <p className="ml-2">Processing...</p>
//                     </div>
//                 )}
//                 {!loading && filteredOrders.length === 0 && searchQuery !== '' && (
//                     <div className="text-center py-4">No matching orders found for "{searchQuery}".</div>
//                 )}
//                 {!loading && filteredOrders.length === 0 && searchQuery === '' && (
//                     <div className="text-center py-4">No orders to display.</div>
//                 )}
//                 {!loading && filteredOrders.length > 0 && (
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Order ID</TableHead>
//                                 <TableHead>Customer</TableHead>
//                                 <TableHead>Items</TableHead>
//                                 <TableHead>Total</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead>Payment Method</TableHead>
//                                 <TableHead>Date</TableHead>
//                                 <TableHead>Actions</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {filteredOrders.map((order) => (
//                                 <TableRow key={order.id}>
//                                     <TableCell className="font-medium">{order.order_number}</TableCell>
//                                     <TableCell>{order.customer_name}</TableCell>
//                                     <TableCell>{order.items}</TableCell>
//                                     <TableCell>KSh {order.total.toLocaleString()}</TableCell>
//                                     <TableCell>
//                                         <Badge className={getStatusColor(order.status)}>
//                                             {order.status}
//                                         </Badge>
//                                     </TableCell>
//                                     <TableCell>{order.paymentMethod}</TableCell>
//                                     <TableCell>{order.date}</TableCell>
//                                     <TableCell>
//                                         <div className="flex gap-2">
//                                             <Button variant="outline" size="sm" onClick={() => handleEditClick(order)}>
//                                                 Edit Status
//                                             </Button>
//                                             <Button variant="destructive" size="sm" onClick={() => handleDeleteOrder(order.id)}>
//                                                 Delete
//                                             </Button>
//                                         </div>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 )}

//                 {/* Pagination Controls */}
//                 {!loading && totalPages > 1 && (
//                     <div className="flex justify-end items-center space-x-2 mt-4">
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handlePageChange(currentPage - 1)}
//                             disabled={currentPage === 1}
//                         >
//                             <ChevronLeft className="h-4 w-4 mr-1" /> Previous
//                         </Button>
//                         <span className="text-sm text-muted-foreground">
//                             Page {currentPage} of {totalPages}
//                         </span>
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handlePageChange(currentPage + 1)}
//                             disabled={currentPage === totalPages}
//                         >
//                             Next <ChevronRight className="h-4 w-4 ml-1" />
//                         </Button>
//                     </div>
//                 )}
//             </CardContent>

//             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//                 <DialogContent>
//                     <DialogHeader>
//                         <DialogTitle>Edit Order Status: {selectedOrder?.order_number}</DialogTitle>
//                         <DialogDescription>Update the status and add notes for this order.</DialogDescription>
//                     </DialogHeader>
//                     {selectedOrder && (
//                         <div className="grid gap-4 py-4">
//                             <div className="grid grid-cols-4 items-center gap-4">
//                                 <Label htmlFor="status" className="text-right">
//                                     Status
//                                 </Label>
//                                 <Select onValueChange={setNewStatus} value={newStatus}>
//                                     <SelectTrigger className="col-span-3">
//                                         <SelectValue placeholder="Select a status" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="pending">Pending</SelectItem>
//                                         <SelectItem value="processing">Processing</SelectItem>
//                                         <SelectItem value="shipped">Shipped</SelectItem>
//                                         <SelectItem value="delivered">Delivered</SelectItem>
//                                         <SelectItem value="cancelled">Cancelled</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                             <div className="grid grid-cols-4 items-center gap-4">
//                                 <Label htmlFor="notes" className="text-right">
//                                     Notes
//                                 </Label>
//                                 <Textarea
//                                     id="notes"
//                                     value={orderNotes}
//                                     onChange={(e) => setOrderNotes(e.target.value)}
//                                     placeholder="Add internal notes about this order..."
//                                     className="col-span-3"
//                                 />
//                             </div>
//                         </div>
//                     )}
//                     <DialogFooter>
//                         <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
//                         <Button onClick={handleUpdateOrder} disabled={loading}>
//                             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </Card>
//     );
// };

// export default AdminOrder;
// frontend/magnet/src/pages/Admin/AdminOrder.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
    Loader2, 
    ChevronLeft, 
    ChevronRight, 
    Search, 
    Edit3, 
    Trash2, 
    Filter,
    MoreHorizontal,
    Package,
    Users,
    DollarSign,
    Calendar,
    Eye,
    Download
} from 'lucide-react';

interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    items: string;
    total: number;
    status: string;
    paymentMethod: string;
    date: string;
    notes?: string;
}

interface AdminOrderProps {
    allOrders: Order[];
    fetchAdminData: (page?: number) => void;
    getStatusColor: (status: string) => string;
    totalOrders: number;
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const AdminOrder: React.FC<AdminOrderProps> = ({
    allOrders,
    fetchAdminData,
    getStatusColor,
    totalOrders,
    totalPages,
    currentPage,
    onPageChange
}) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        let filtered = allOrders;
        
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(order =>
                order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.items.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }
        
        setFilteredOrders(filtered);
    }, [searchQuery, statusFilter, allOrders]);

    const handleEditClick = (order: Order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setOrderNotes(order.notes || '');
        setIsEditDialogOpen(true);
    };

    const handleUpdateOrder = async () => {
        if (!selectedOrder) return;

        setLoading(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/orders/${selectedOrder.id}/status`,
                { status: newStatus, order_notes: orderNotes },
                { withCredentials: true }
            );
            fetchAdminData(currentPage);
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to update order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (window.confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
            setLoading(true);
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/orders/${orderId}`, { withCredentials: true });
                fetchAdminData(currentPage);
            } catch (error) {
                console.error('Failed to delete order:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        const baseClasses = "font-medium transition-all duration-200 hover:scale-105";
        switch (status.toLowerCase()) {
            case 'pending':
                return `${baseClasses} bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200`;
            case 'processing':
                return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200`;
            case 'shipped':
                return `${baseClasses} bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200`;
            case 'delivered':
                return `${baseClasses} bg-green-100 text-green-800 border-green-200 hover:bg-green-200`;
            case 'cancelled':
                return `${baseClasses} bg-red-100 text-red-800 border-red-200 hover:bg-red-200`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200`;
        }
    };

    const uniqueStatuses = [...new Set(allOrders.map(order => order.status))];

    return (
        <div className="space-y-6">
            {/* Header Section with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Order Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track all customer orders in one place
                    </p>
                </div>
                
                {/* Quick Stats */}
                <div className="flex gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Total Orders</p>
                                <p className="text-2xl font-bold text-blue-700">{totalOrders}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-900">Current Page</p>
                                <p className="text-2xl font-bold text-green-700">{currentPage}/{totalPages}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Package className="h-5 w-5 text-primary" />
                                Orders Overview
                            </CardTitle>
                            <CardDescription>
                                View, update, and manage the status of all customer orders
                            </CardDescription>
                        </div>
                        <Button variant="outline" className="shrink-0 bg-white hover:bg-gray-50">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </CardHeader>
                
                <CardContent className="p-6">
                    {/* Enhanced Search and Filter Section */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by customer name, order ID, or items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white border-gray-200 focus:border-primary focus:ring-primary/20"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-white">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {uniqueStatuses.map(status => (
                                        <SelectItem key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center h-64 bg-gradient-to-br from-gray-50 to-white rounded-lg">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                                <p className="text-muted-foreground font-medium">Processing your request...</p>
                            </div>
                        </div>
                    )}

                    {/* Empty States */}
                    {!loading && filteredOrders.length === 0 && searchQuery !== '' && (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-lg">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching orders found</h3>
                            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
                        </div>
                    )}

                    {!loading && filteredOrders.length === 0 && searchQuery === '' && (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-lg">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders to display</h3>
                            <p className="text-muted-foreground">Orders will appear here once customers start placing them</p>
                        </div>
                    )}

                    {/* Enhanced Table */}
                    {!loading && filteredOrders.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150">
                                        <TableHead className="font-semibold text-gray-900">Order ID</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Items</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Total</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Payment</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Date</TableHead>
                                        <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order, index) => (
                                        <TableRow 
                                            key={order.id} 
                                            className={`
                                                hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 
                                                transition-all duration-200 border-b border-gray-100
                                                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                                            `}
                                        >
                                            <TableCell className="font-mono font-medium text-blue-700">
                                                #{order.order_number}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    {order.customer_name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={order.items}>
                                                {order.items}
                                            </TableCell>
                                            <TableCell className="font-semibold text-green-700">
                                                KSh {order.total.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadgeStyle(order.status)}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize text-muted-foreground">
                                                {order.paymentMethod}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {order.date}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleEditClick(order)}
                                                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Enhanced Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                            <div className="text-sm text-muted-foreground">
                                Showing page {currentPage} of {totalPages} ({totalOrders} total orders)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="bg-white hover:bg-gray-50"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={pageNum === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-8 h-8 p-0 ${
                                                    pageNum === currentPage 
                                                        ? 'bg-primary text-primary-foreground' 
                                                        : 'bg-white hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="bg-white hover:bg-gray-50"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Enhanced Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Edit3 className="h-5 w-5 text-primary" />
                            Edit Order: #{selectedOrder?.order_number}
                        </DialogTitle>
                        <DialogDescription>
                            Update the status and add internal notes for this order
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            {/* Order Info Summary */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Customer:</span>
                                        <p className="font-semibold">{selectedOrder.customer_name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Total:</span>
                                        <p className="font-semibold text-green-700">KSh {selectedOrder.total.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-medium">
                                    Order Status
                                </Label>
                                <Select onValueChange={setNewStatus} value={newStatus}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">🕐 Pending</SelectItem>
                                        <SelectItem value="processing">⚙️ Processing</SelectItem>
                                        <SelectItem value="shipped">📦 Shipped</SelectItem>
                                        <SelectItem value="delivered">✅ Delivered</SelectItem>
                                        <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notes Section */}
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-medium">
                                    Internal Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={orderNotes}
                                    onChange={(e) => setOrderNotes(e.target.value)}
                                    placeholder="Add internal notes about this order..."
                                    className="min-h-[100px] bg-white"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="pt-4 border-t">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditDialogOpen(false)}
                            className="bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleUpdateOrder} 
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminOrder;