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
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'; // Import Chevron icons

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
    fetchAdminData: (page?: number) => void; // Modified to accept an optional page number
    getStatusColor: (status: string) => string;
    totalOrders: number; // NEW prop: total number of orders (across all pages)
    totalPages: number; // NEW prop: total number of pages
    currentPage: number; // NEW prop: current page number
    onPageChange: (page: number) => void; // NEW prop: function to change page
}

const AdminOrder: React.FC<AdminOrderProps> = ({
    allOrders,
    fetchAdminData,
    getStatusColor,
    totalOrders, // Destructure new props
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

    useEffect(() => {
        // Filter locally based on the `allOrders` currently displayed (which are already paginated)
        setFilteredOrders(
            allOrders.filter(order =>
                order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) || // Allow search by order number
                order.items.toLowerCase().includes(searchQuery.toLowerCase()) // Allow search by items
            )
        );
    }, [searchQuery, allOrders]); // Depend on allOrders (the current page's data)

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
            fetchAdminData(currentPage); // Re-fetch current page after update
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
                fetchAdminData(currentPage); // Re-fetch current page after delete
            } catch (error) {
                console.error('Failed to delete order:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page); // Notify parent to fetch data for the new page
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Orders</CardTitle>
                <CardDescription>View, update, and manage the status of all customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Input
                        type="text"
                        placeholder="Search by customer name, order ID or items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {loading && ( // Show loading indicator during update/delete
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="ml-2">Processing...</p>
                    </div>
                )}
                {!loading && filteredOrders.length === 0 && searchQuery !== '' && (
                    <div className="text-center py-4">No matching orders found for "{searchQuery}".</div>
                )}
                {!loading && filteredOrders.length === 0 && searchQuery === '' && (
                    <div className="text-center py-4">No orders to display.</div>
                )}
                {!loading && filteredOrders.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.order_number}</TableCell>
                                    <TableCell>{order.customer_name}</TableCell>
                                    <TableCell>{order.items}</TableCell>
                                    <TableCell>KSh {order.total.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{order.paymentMethod}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(order)}>
                                                Edit Status
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteOrder(order.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-end items-center space-x-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </CardContent>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Order Status: {selectedOrder?.order_number}</DialogTitle>
                        <DialogDescription>Update the status and add notes for this order.</DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Status
                                </Label>
                                <Select onValueChange={setNewStatus} value={newStatus}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="notes" className="text-right">
                                    Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={orderNotes}
                                    onChange={(e) => setOrderNotes(e.target.value)}
                                    placeholder="Add internal notes about this order..."
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateOrder} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default AdminOrder;