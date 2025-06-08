// frontend/magnet/src/pages/Admin/AdminOrder.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; // For notes/comments
// import { useToast } from '@/components/ui/use-toast'; // Uncomment if you have toast notifications
import { Loader2 } from 'lucide-react';

interface Order {
    id: string;
    date: string;
    items: string;
    total: number;
    status: string;
    paymentMethod: string;
    customer: string;
    notes?: string; // Add a notes field
}

interface AdminOrderProps {
    allOrders: Order[];
    fetchAdminData: () => void;
    getStatusColor: (status: string) => string;
}

const AdminOrder: React.FC<AdminOrderProps> = ({ allOrders, fetchAdminData, getStatusColor }) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // const { toast } = useToast(); // Uncomment if you have toast notifications

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
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/orders/${selectedOrder.id}`,
                { status: newStatus, notes: orderNotes },
                { withCredentials: true }
            );
            // toast({ title: 'Order Updated', description: `Order ${selectedOrder.id} status updated to ${newStatus}.` }); // Uncomment
            fetchAdminData(); // Re-fetch all admin data to update the UI
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to update order:', error);
            // toast({ title: 'Error', description: 'Failed to update order status.', variant: 'destructive' }); // Uncomment
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (window.confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
            setLoading(true);
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/admin/orders/${orderId}`, { withCredentials: true });
                // toast({ title: 'Order Deleted', description: `Order ${orderId} has been deleted.` }); // Uncomment
                fetchAdminData();
            } catch (error) {
                console.error('Failed to delete order:', error);
                // toast({ title: 'Error', description: 'Failed to delete order.', variant: 'destructive' }); // Uncomment
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Orders</CardTitle>
                <CardDescription>View, update, and manage the status of all customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="ml-2">Loading orders...</p>
                    </div>
                ) : (
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
                            {allOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customer}</TableCell>
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
            </CardContent>

            {/* Edit Order Status Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Order Status: {selectedOrder?.id}</DialogTitle>
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