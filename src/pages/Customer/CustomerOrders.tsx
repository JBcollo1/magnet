import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Define the Order interface
interface Order {
  id: string;
  order_number: string;
  date: string;
  items: string;
  total: number;
  status: string;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  paymentStatus?: string;
  paymentId?: string;
  paymentAmount?: number;
  paymentDate?: string;
  verificationDate?: string;
  isCompleted?: boolean;
  isFailed?: boolean;
  isPending?: boolean;
  verifiedBy?: {
    admin_name: string;
    verification_date: string;
  };
}

const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ orders: Order[] }>(
        `${import.meta.env.VITE_API_URL}/orders`,
        { withCredentials: true } // This ensures cookies are sent with the request
      );

      // Assuming the response data is structured as { orders: Order[] }
      const ordersData = Array.isArray(response.data.orders) ? response.data.orders : [];
      setOrders(ordersData);

      // Fetch payment status for each order
      for (const order of ordersData) {
        await fetchPaymentStatusForOrder(order.id);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Fallback data for demonstration if API fails
      setOrders([
        { id: 'ORD-001', order_number: 'ORD-20231201-12345678', date: '2024-12-01', items: '4-CUSTOM MAGNETS', total: 800, status: 'Delivered', paymentMethod: 'M-Pesa', trackingNumber: 'TRK001234', estimatedDelivery: '2024-12-05' },
        { id: 'ORD-002', order_number: 'ORD-20231215-23456789', date: '2024-12-15', items: '6-CUSTOM MAGNETS', total: 1200, status: 'Processing', paymentMethod: 'M-Pesa', trackingNumber: 'TRK001235', estimatedDelivery: '2024-12-20' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Define the type for the payment status API response
  interface PaymentStatusResponse {
    payment_status: string;
    payment_id?: string;
    payment_amount?: number;
    payment_date?: string;
    verification_date?: string;
    is_completed?: boolean;
    is_failed?: boolean;
    is_pending?: boolean;
    verified_by?: {
      admin_name: string;
      verification_date: string;
    } | null;
  }

  const fetchPaymentStatusForOrder = async (orderId: string) => {
    setPaymentStatusLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await axios.get<PaymentStatusResponse>(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/payment/status`,
        { withCredentials: true }
      );

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? {
                ...order,
                paymentStatus: response.data.payment_status,
                paymentId: response.data.payment_id,
                paymentAmount: response.data.payment_amount,
                paymentDate: response.data.payment_date,
                verificationDate: response.data.verification_date,
                isCompleted: response.data.is_completed,
                isFailed: response.data.is_failed,
                isPending: response.data.is_pending,
                verifiedBy: response.data.verified_by,
              }
            : order
        )
      );
    } catch (error) {
      console.error(`Failed to fetch payment status for order ${orderId}:`, error);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, paymentStatus: 'unknown' }
            : order
        )
      );
    } finally {
      setPaymentStatusLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'shipped': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'processing':
      case 'pending': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'failed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'no_payment': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-gray-900 dark:text-gray-100" />
        <span className="text-gray-700 dark:text-gray-300">Loading your orders...</span>
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100">Your Order History</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Track your magnet orders and delivery status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-900 dark:text-gray-100">Order Number</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Items</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Total</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Order Status</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Date</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">{order.order_number}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{order.items}</TableCell>
                  <TableCell className="font-medium text-green-600 dark:text-green-400">KSh {order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{order.date}</TableCell>
                  <TableCell>
                    {paymentStatusLoading[order.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    ) : (
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus ? (
                          <>
                            {order.paymentStatus.replace(/_/g, ' ')}{' '}
                            {order.isCompleted && order.verifiedBy && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                (by {order.verifiedBy.admin_name})
                              </span>
                            )}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 dark:text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-300">No orders yet. Start shopping to see your order history!</p>
            <Button onClick={() => window.location.href = '/'} className="mt-4 bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">
              Browse Magnets
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerOrders;
