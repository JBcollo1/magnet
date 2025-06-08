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

interface Payment {
    id: string;
    orderId: string;
    amount: number;
    method: 'M-Pesa' | 'Card' | 'Cash on Delivery';
    status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    transactionId?: string;
    paymentDate: string;
    customerEmail: string;
}

interface Order {
    id: string;
    date: string;
    items: string;
    total: number;
    status: string;
    paymentMethod: string;
    paymentStatus?: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    mpesaRef?: string;
    customer: string;
}

interface AdminPaymentProps {
    allOrders: Order[];
    fetchAdminData: () => void;
}

const AdminPayment: React.FC<AdminPaymentProps> = ({ allOrders, fetchAdminData }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [newPaymentStatus, setNewPaymentStatus] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const derivedPayments: Payment[] = allOrders.map(order => ({
            id: `PAY-${order.id}`,
            orderId: order.id,
            amount: order.total,
            method: order.paymentMethod as 'M-Pesa' | 'Card' | 'Cash on Delivery',
            status: order.paymentStatus || (order.status === 'delivered' ? 'Completed' : 'Pending'),
            transactionId: order.mpesaRef,
            paymentDate: order.date,
            customerEmail: `${order.customer.toLowerCase().replace(/\s/g, '.')}@example.com`
        }));
        setPayments(derivedPayments);
    }, [allOrders]);

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'failed':
            case 'refunded': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
            await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/payments/${selectedPayment.id}/status`,
                { status: newPaymentStatus, orderId: selectedPayment.orderId },
                { withCredentials: true }
            );
            fetchAdminData();
            setIsVerifyDialogOpen(false);
        } catch (error) {
            console.error('Failed to update payment status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckMpesaStatus = async (transactionId: string) => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/admin/mpesa/check-status`,
                { transactionId },
                { withCredentials: true }
            );
            alert(`M-Pesa Transaction Status for ${transactionId}: ${(response.data as { status: string }).status}`);
            fetchAdminData();
        } catch (error: any) {
            console.error('Failed to check M-Pesa status:', error);
            alert(`Failed to check M-Pesa status: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gray-50 dark:bg-gray-700">
                <CardTitle className="text-gray-900 dark:text-gray-100">Payment Management</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                    Verify payments and manage M-Pesa transaction statuses.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading && !selectedPayment ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-900 dark:text-gray-100" />
                        <p className="ml-2 text-gray-700 dark:text-gray-300">Loading payments...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-100 dark:bg-gray-700">
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Order ID</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Customer Email</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Method</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Transaction ID</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Payment Date</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment) => (
                                    <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{payment.orderId}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">{payment.customerEmail}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">KSh {payment.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">{payment.method}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">{payment.transactionId || 'N/A'}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">{payment.paymentDate}</TableCell>
                                        <TableCell>
                                            <Badge className={getPaymentStatusColor(payment.status)}>
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleVerifyClick(payment)}
                                                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                                                >
                                                    Verify/Update
                                                </Button>
                                                {payment.method === 'M-Pesa' && payment.transactionId && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleCheckMpesaStatus(payment.transactionId!)}
                                                        disabled={loading}
                                                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    </div>
                )}
            </CardContent>

            <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">
                            Update Payment Status for Order: {selectedPayment?.orderId}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-300">
                            Manually update the status of this payment.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right text-gray-700 dark:text-gray-300">
                                    Amount
                                </Label>
                                <Input
                                    id="amount"
                                    value={`KSh ${selectedPayment.amount.toLocaleString()}`}
                                    readOnly
                                    className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="transactionId" className="text-right text-gray-700 dark:text-gray-300">
                                    Transaction ID
                                </Label>
                                <Input
                                    id="transactionId"
                                    value={selectedPayment.transactionId || 'N/A'}
                                    readOnly
                                    className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right text-gray-700 dark:text-gray-300">
                                    Status
                                </Label>
                                <Select onValueChange={setNewPaymentStatus} value={newPaymentStatus}>
                                    <SelectTrigger className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                                        <SelectValue placeholder="Select payment status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
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
                        <Button
                            variant="outline"
                            onClick={() => setIsVerifyDialogOpen(false)}
                            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdatePaymentStatus}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default AdminPayment;
