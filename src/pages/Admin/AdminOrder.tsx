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
    Eye
} from 'lucide-react';

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
       console.log('orders:', allOrders );
        if (searchQuery) {
            filtered = filtered.filter(order => {
                const customerName = order.customer_name || '';
                const orderNumber = order.order_number || '';
                const itemsText = order.order_items.map(item => item.product_name).join(', ');
                
                return customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       itemsText.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    }, [searchQuery, statusFilter, allOrders]);

    const handleEditClick = (order: Order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setOrderNotes(order.order_notes || '');
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
            // Optionally, add user-friendly error feedback here
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
                // Optionally, add user-friendly error feedback here
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

    // Helper function to format order items for display
    const formatOrderItems = (orderItems: OrderItem[]) => {
        return orderItems.map(item => 
            `${item.product_name} (${item.quantity}x)`
        ).join(', ');
    };

    // Helper function to calculate total items count
    const getTotalItemsCount = (orderItems: OrderItem[]) => {
        return orderItems.reduce((total, item) => total + item.quantity, 0);
    };

    const uniqueStatuses = [...new Set(allOrders.map(order => order.status))];

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Order Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track all customer orders in one place
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700/50">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Orders</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalOrders}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700/50">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="text-sm font-medium text-green-900 dark:text-green-300">Current Page</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{currentPage}/{totalPages}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 dark:border dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-600">
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
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by customer name, order ID, or items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 dark:border-gray-600">
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

                    {loading && (
                        <div className="flex justify-center items-center h-64 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                                <p className="text-muted-foreground font-medium">Processing your request...</p>
                            </div>
                        </div>
                    )}

                    {!loading && filteredOrders.length === 0 && searchQuery !== '' && (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No matching orders found</h3>
                            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
                        </div>
                    )}

                    {!loading && filteredOrders.length === 0 && searchQuery === '' && (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No orders to display</h3>
                            <p className="text-muted-foreground">Orders will appear here once customers start placing them</p>
                        </div>
                    )}

                    {!loading && filteredOrders.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-150 dark:hover:from-gray-600 dark:hover:to-gray-550">
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Order ID</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Customer</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Items</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Total</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Phone</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order, index) => (
                                        <TableRow
                                            key={order.id}
                                            className={`
                                                hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20
                                                transition-all duration-200 border-b border-gray-100 dark:border-gray-700
                                                ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750/30'}
                                            `}
                                        >
                                            <TableCell className="font-mono font-medium text-blue-700 dark:text-blue-400">
                                                #{order.order_number}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    {order.customer_name || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={formatOrderItems(order.order_items)}>
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-3 w-3 text-muted-foreground" />
                                                    <span>{formatOrderItems(order.order_items)}</span>
                                                    <Badge variant="secondary" className="ml-1 text-xs">
                                                        {getTotalItemsCount(order.order_items)}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-green-700 dark:text-green-400">
                                                KSh {order.total_amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadgeStyle(order.status)}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {order.customer_phone || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditClick(order)}
                                                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                                                        title="Edit Order"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                                        title="Delete Order"
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

                    {!loading && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg border dark:border-gray-600">
                            <div className="text-sm text-muted-foreground">
                                Showing page {currentPage} of {totalPages} ({totalOrders} total orders)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600"
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
                                                        : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600'
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
                                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader className="pb-4 border-b dark:border-gray-600">
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
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Customer:</span>
                                        <p className="font-semibold dark:text-white">{selectedOrder.customer_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Total:</span>
                                        <p className="font-semibold text-green-700 dark:text-green-400">KSh {selectedOrder.total_amount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Phone:</span>
                                        <p className="font-semibold dark:text-white">{selectedOrder.customer_phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Items:</span>
                                        <p className="font-semibold dark:text-white">{getTotalItemsCount(selectedOrder.order_items)} items</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order-items" className="text-sm font-medium">
                                    Order Items
                                </Label>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md max-h-32 overflow-y-auto">
                                    {selectedOrder.order_items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm py-1">
                                            <span>{item.product_name}</span>
                                            <span className="text-muted-foreground">
                                                {item.quantity}x @ KSh {item.unit_price.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-medium">
                                    Order Status
                                </Label>
                                <Select onValueChange={setNewStatus} value={newStatus}>
                                    <SelectTrigger className="bg-white dark:bg-gray-800">
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

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-medium">
                                    Internal Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={orderNotes}
                                    onChange={(e) => setOrderNotes(e.target.value)}
                                    placeholder="Add internal notes about this order..."
                                    className="min-h-[100px] bg-white dark:bg-gray-800"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="pt-4 border-t dark:border-gray-600">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
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