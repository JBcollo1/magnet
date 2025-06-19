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
    Image as ImageIcon, // Renamed to avoid conflict with Image component
    CheckCircle,
    XCircle,
    Clock,
    Brush,
    ClipboardType
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

interface CustomImage {
    id: string;
    user_id: string;
    username: string;
    image_url: string;
    status: 'pending' | 'approved' | 'rejected';
    uploaded_at: string;
    admin_notes?: string;
}

interface AdminOrderProps {
    allOrders: Order[];
    fetchAdminData: (page?: number) => void;
    getStatusColor: (status: string) => string; // This prop seems unused, but kept for completeness
    totalOrders: number;
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const AdminOrder: React.FC<AdminOrderProps> = ({
    allOrders,
    fetchAdminData,
    // getStatusColor, // Unused prop
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

    // State for Image Management
    const [customImages, setCustomImages] = useState<CustomImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [isImageApprovalDialogOpen, setIsImageApprovalDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<CustomImage | null>(null);
    const [imageApprovalStatus, setImageApprovalStatus] = useState<'approved' | 'rejected' | ''>('');
    const [imageAdminNotes, setImageAdminNotes] = useState('');
    const [imageSearchQuery, setImageSearchQuery] = useState('');
    const [filteredImages, setFilteredImages] = useState<CustomImage[]>([]);
    const [imageStatusFilter, setImageStatusFilter] = useState('all');

    useEffect(() => {
        let filtered = allOrders;

        if (searchQuery) {
            filtered = filtered.filter(order =>
                order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.items.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    }, [searchQuery, statusFilter, allOrders]);

    useEffect(() => {
        let filtered = customImages;

        if (imageSearchQuery) {
            filtered = filtered.filter(image =>
                image.username.toLowerCase().includes(imageSearchQuery.toLowerCase()) ||
                image.user_id.toLowerCase().includes(imageSearchQuery.toLowerCase()) ||
                image.id.toLowerCase().includes(imageSearchQuery.toLowerCase())
            );
        }

        if (imageStatusFilter !== 'all') {
            filtered = filtered.filter(image => image.status === imageStatusFilter);
        }

        setFilteredImages(filtered);
    }, [imageSearchQuery, imageStatusFilter, customImages]);

    // Order Management Functions
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

    const getApproveRejectBadgeStyle = (status: 'pending' | 'approved' | 'rejected') => {
        const baseClasses = "font-medium transition-all duration-200 hover:scale-105";
        switch (status) {
            case 'pending':
                return `${baseClasses} bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200`;
            case 'approved':
                return `${baseClasses} bg-green-100 text-green-800 border-green-200 hover:bg-green-200`;
            case 'rejected':
                return `${baseClasses} bg-red-100 text-red-800 border-red-200 hover:bg-red-200`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200`;
        }
    };

    const uniqueStatuses = [...new Set(allOrders.map(order => order.status))];
    const uniqueImageStatuses = [...new Set(customImages.map(image => image.status))];

    // Image Management Functions
    const fetchCustomImages = async () => {
        setLoadingImages(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/custom-images`, { withCredentials: true });
            setCustomImages(response.data as CustomImage[]);
        } catch (error) {
            console.error('Failed to fetch custom images:', error);
            // Handle error
        } finally {
            setLoadingImages(false);
        }
    };

    const handleApproveRejectClick = (image: CustomImage) => {
        setSelectedImage(image);
        setImageApprovalStatus(image.status === 'approved' ? 'approved' : image.status === 'rejected' ? 'rejected' : '');
        setImageAdminNotes(image.admin_notes || '');
        setIsImageApprovalDialogOpen(true);
    };

    const handleUpdateImageApproval = async () => {
        if (!selectedImage || !imageApprovalStatus) return;

        setLoadingImages(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/custom-images/${selectedImage.id}/approval`,
                { status: imageApprovalStatus, admin_notes: imageAdminNotes },
                { withCredentials: true }
            );
            fetchCustomImages(); // Refresh image list
            setIsImageApprovalDialogOpen(false);
        } catch (error) {
            console.error('Failed to update image approval status:', error);
            // Handle error
        } finally {
            setLoadingImages(false);
        }
    };

    const handleCleanupAbandonedImages = async () => {
        if (window.confirm('Are you sure you want to run the cleanup for abandoned pending images? This action cannot be undone.')) {
            setLoadingImages(true);
            try {
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/custom-images/cleanup`, {}, { withCredentials: true });
                alert('Cleanup task initiated successfully. Check server logs for details.');
                fetchCustomImages(); // Refresh the list after cleanup
            } catch (error) {
                console.error('Failed to trigger cleanup:', error);
                alert('Failed to initiate cleanup task. See console for details.');
            } finally {
                setLoadingImages(false);
            }
        }
    };

    useEffect(() => {
        fetchCustomImages(); // Fetch images on component mount
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage orders and custom image uploads
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

            {/* Order Management Card */}
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
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Payment</TableHead>
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
                                                    {order.customer_name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={order.items}>
                                                {order.items}
                                            </TableCell>
                                            <TableCell className="font-semibold text-green-700 dark:text-green-400">
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
                                                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors"
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
                                        <p className="font-semibold dark:text-white">{selectedOrder.customer_name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Total:</span>
                                        <p className="font-semibold text-green-700 dark:text-green-400">KSh {selectedOrder.total.toLocaleString()}</p>
                                    </div>
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

            {/* --- */}
            {/* Image Management Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 dark:border dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                Custom Image Approvals
                            </CardTitle>
                            <CardDescription>
                                Review and approve/reject custom images uploaded by users.
                            </CardDescription>
                        </div>
                        <Button
                            onClick={handleCleanupAbandonedImages}
                            disabled={loadingImages}
                            className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-700 dark:hover:bg-red-800"
                        >
                            {loadingImages ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cleaning up...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Cleanup Abandoned
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by user, image ID..."
                                value={imageSearchQuery}
                                onChange={(e) => setImageSearchQuery(e.target.value)}
                                className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={imageStatusFilter} onValueChange={setImageStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 dark:border-gray-600">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {uniqueImageStatuses.map(status => (
                                        <SelectItem key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {loadingImages && (
                        <div className="flex justify-center items-center h-64 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-3" />
                                <p className="text-muted-foreground font-medium">Loading custom images...</p>
                            </div>
                        </div>
                    )}

                    {!loadingImages && filteredImages.length === 0 && imageSearchQuery !== '' && (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg">
                            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No matching images found</h3>
                            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
                        </div>
                    )}

                    {!loadingImages && filteredImages.length === 0 && imageSearchQuery === '' && (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg">
                            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No custom images to display</h3>
                            <p className="text-muted-foreground">User-uploaded images pending approval will appear here.</p>
                        </div>
                    )}

                    {!loadingImages && filteredImages.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-150 dark:hover:from-gray-600 dark:hover:to-gray-550">
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Image ID</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">User</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Preview</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Uploaded At</TableHead>
                                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredImages.map((image, index) => (
                                        <TableRow
                                            key={image.id}
                                            className={`
                                                hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20
                                                transition-all duration-200 border-b border-gray-100 dark:border-gray-700
                                                ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750/30'}
                                            `}
                                        >
                                            <TableCell className="font-mono text-purple-700 dark:text-purple-400">
                                                {image.id.substring(0, 8)}...
                                            </TableCell>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                {image.username}
                                            </TableCell>
                                            <TableCell>
                                                <a href={image.image_url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600 hover:border-primary transition-colors">
                                                    <img src={image.image_url} alt="Custom Image" className="w-full h-full object-cover" />
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getApproveRejectBadgeStyle(image.status)}>
                                                    {image.status.charAt(0).toUpperCase() + image.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(image.uploaded_at).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleApproveRejectClick(image)}
                                                        className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Image Approval Dialog */}
            <Dialog open={isImageApprovalDialogOpen} onOpenChange={setIsImageApprovalDialogOpen}>
                <DialogContent className="sm:max-w-[550px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader className="pb-4 border-b dark:border-gray-600">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Brush className="h-5 w-5 text-purple-600" />
                            Review Custom Image: {selectedImage?.id.substring(0, 8)}...
                        </DialogTitle>
                        <DialogDescription>
                            Approve or reject this custom image.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedImage && (
                        <div className="space-y-6 py-4">
                            <div className="flex justify-center">
                                <img
                                    src={selectedImage.image_url}
                                    alt="Custom Image Preview"
                                    className="max-w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-md"
                                />
                            </div>
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-300">User:</span>
                                        <p className="font-semibold dark:text-white">{selectedImage.username}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Uploaded At:</span>
                                        <p className="font-semibold dark:text-white">{new Date(selectedImage.uploaded_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image-status" className="text-sm font-medium">
                                    Approval Status
                                </Label>
                                <Select
                                    onValueChange={(value: 'approved' | 'rejected' | '') => setImageApprovalStatus(value)}
                                    value={imageApprovalStatus}
                                >
                                    <SelectTrigger className="bg-white dark:bg-gray-800">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-amber-500" /> Pending
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="approved">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" /> Approve
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500" /> Reject
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image-notes" className="text-sm font-medium">
                                    Admin Notes (Optional)
                                </Label>
                                <Textarea
                                    id="image-notes"
                                    value={imageAdminNotes}
                                    onChange={(e) => setImageAdminNotes(e.target.value)}
                                    placeholder="Add notes for this image (e.g., reason for rejection)..."
                                    className="min-h-[100px] bg-white dark:bg-gray-800"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="pt-4 border-t dark:border-gray-600">
                        <Button
                            variant="outline"
                            onClick={() => setIsImageApprovalDialogOpen(false)}
                            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateImageApproval}
                            disabled={loadingImages || !imageApprovalStatus}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {loadingImages ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Save Approval'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminOrder;