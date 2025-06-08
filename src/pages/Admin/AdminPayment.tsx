// frontend/magnet/src/pages/Admin/AdminPayment.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
// import { useToast } from '@/components/ui/use-toast'; // Uncomment if you have toast notifications

interface Payment {
    id: string;
    orderId: string;
    amount: number;
    method: 'M-Pesa' | 'Card' | 'Cash on Delivery';
    status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    transactionId?: string; // For M-Pesa or card
    paymentDate: string;
    customerEmail: string;
}

// Assuming orders have a link to payment status
interface Order {
    id: string;
    date: string;
    items: string;
    total: number;
    status: string; // Order status
    paymentMethod: string;
    paymentStatus?: 'Pending' | 'Completed' | 'Failed' | 'Refunded'; // Add payment status to order
    mpesaRef?: string; // M-Pesa transaction reference
    customer: string;
}

interface AdminPaymentProps {
    allOrders: Order[]; // We'll derive payment info from orders for now
    fetchAdminData: () => void;
}

const AdminPayment: React.FC<AdminPaymentProps> = ({ allOrders, fetchAdminData }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [newPaymentStatus, setNewPaymentStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // const { toast } = useToast(); // Uncomment if you have toast notifications

    useEffect(() => {
        // Derive payment data from orders for display purposes.
        // In a real app, you might have a separate payments endpoint.
        const derivedPayments: Payment[] = allOrders.map(order => ({
            id: `PAY-${order.id}`, // Fictional payment ID
            orderId: order.id,
            amount: order.total,
            method: order.paymentMethod as 'M-Pesa' | 'Card' | 'Cash on Delivery',
            status: order.paymentStatus || (order.status === 'delivered' ? 'Completed' : 'Pending'), // Infer status
            transactionId: order.mpesaRef, // Use mpesaRef as transactionId
            paymentDate: order.date,
            customerEmail: `${order.customer.toLowerCase().replace(/\s/g, '.')}@example.com` // Fictional email
        }));
        setPayments(derivedPayments);
    }, [allOrders]);

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-orange-600 bg-orange-100';
            case 'failed':
            case 'refunded': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleVerifyClick = (payment: Payment) => {
        setSelectedPayment(payment);
        setNewPaymentStatus(payment.status);
        setIsVerifyDialogOpen(true);
    };

    const handleUpdatePaymentStatus = async () => {
        if (!selectedPayment) return;

        setLoading(true);
        try {
            // In a real scenario, this would call an API endpoint like:
            // /admin/payments/{paymentId}/status or /admin/orders/{orderId}/payment-status
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/payments/${selectedPayment.id}/status`,
                { status: newPaymentStatus, orderId: selectedPayment.orderId }, // Also send orderId if needed
                { withCredentials: true }
            );
            // toast({ title: 'Payment Status Updated', description: `Payment for Order ${selectedPayment.orderId} updated to ${newPaymentStatus}.` }); // Uncomment
            fetchAdminData(); // Re-fetch orders to update payment status in dashboard
            setIsVerifyDialogOpen(false);
        } catch (error) {
            console.error('Failed to update payment status:', error);
            // toast({ title: 'Error', description: 'Failed to update payment status.', variant: 'destructive' }); // Uncomment
        } finally {
            setLoading(false);
        }
    };

    // M-Pesa specific management (could be a sub-tab or modal)
    const handleCheckMpesaStatus = async (transactionId: string) => {
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/mpesa/check-status`,
                { transactionId },
                { withCredentials: true }
            );
            // toast({ title: 'M-Pesa Status', description: `Transaction ${transactionId}: ${response.data.status}` }); // Uncomment
            alert(`M-Pesa Transaction Status for ${transactionId}: ${(response.data as { status: string }).status}`); // For demo
            fetchAdminData(); // Refresh data in case status changed
        } catch (error: any) {
            console.error('Failed to check M-Pesa status:', error);
            // toast({ title: 'Error', description: `Failed to check M-Pesa status: ${error.response?.data?.message || error.message}`, variant: 'destructive' }); // Uncomment
            alert(`Failed to check M-Pesa status: ${error.response?.data?.message || error.message}`); // For demo
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>Verify payments and manage M-Pesa transaction statuses.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading && !selectedPayment ? ( // Only show global loader if not in dialog
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="ml-2">Loading payments...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer Email</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Payment Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium">{payment.orderId}</TableCell>
                                    <TableCell>{payment.customerEmail}</TableCell>
                                    <TableCell>KSh {payment.amount.toLocaleString()}</TableCell>
                                    <TableCell>{payment.method}</TableCell>
                                    <TableCell>{payment.transactionId || 'N/A'}</TableCell>
                                    <TableCell>{payment.paymentDate}</TableCell>
                                    <TableCell>
                                        <Badge className={getPaymentStatusColor(payment.status)}>
                                            {payment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleVerifyClick(payment)}>
                                                Verify/Update
                                            </Button>
                                            {payment.method === 'M-Pesa' && payment.transactionId && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleCheckMpesaStatus(payment.transactionId!)}
                                                    disabled={loading}
                                                >
                                                    {loading && selectedPayment?.id === payment.id ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : 'Check M-Pesa'}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Verify/Update Payment Dialog */}
            <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Payment Status for Order: {selectedPayment?.orderId}</DialogTitle>
                        <DialogDescription>
                            Manually update the status of this payment.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Amount
                                </Label>
                                <Input id="amount" value={`KSh ${selectedPayment.amount.toLocaleString()}`} readOnly className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="transactionId" className="text-right">
                                    Transaction ID
                                </Label>
                                <Input id="transactionId" value={selectedPayment.transactionId || 'N/A'} readOnly className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Status
                                </Label>
                                <Select onValueChange={setNewPaymentStatus} value={newPaymentStatus}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select payment status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Failed">Failed</SelectItem>
                                        <SelectItem value="Refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdatePaymentStatus} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default AdminPayment;