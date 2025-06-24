import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Loader2, RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Unified Order interface with all necessary fields
export interface Order {
  id: string;
  order_number: string;
  items: string;
  total: number;
  status: string;
  date: string;
  paymentMethod: string; // Changed to required
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
  };
}

interface CustomerOrdersProps {
  orders: Order[];
  onOrdersUpdate?: (orders: Order[]) => void;
}

const CustomerOrders = ({ orders: initialOrders, onOrdersUpdate }: CustomerOrdersProps) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState<Record<string, boolean>>({});
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const updateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    if (onOrdersUpdate) {
      onOrdersUpdate(newOrders);
    }
  };

  const fetchPaymentStatusForOrder = async (orderId: string) => {
    if (!user || user.role !== 'CUSTOMER') return;

    setPaymentStatusLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await axios.get<PaymentStatusResponse>(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/payment/status`,
        {
          withCredentials: true,
          timeout: 10000
        }
      );

      const updatedOrders = orders.map(order =>
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
      );

      updateOrders(updatedOrders);
    } catch (error) {
      console.error(`Failed to fetch payment status for order ${orderId}:`, error);

      const updatedOrders = orders.map(order =>
        order.id === orderId
          ? { ...order, paymentStatus: 'unknown' }
          : order
      );

      updateOrders(updatedOrders);
    } finally {
      setPaymentStatusLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const refreshPaymentStatus = async (orderId: string) => {
    await fetchPaymentStatusForOrder(orderId);
  };

  const refreshAllPaymentStatuses = async () => {
    if (!user || user.role !== 'CUSTOMER') return;

    const promises = orders.map(order => fetchPaymentStatusForOrder(order.id));
    await Promise.all(promises);
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    if (user?.role === 'CUSTOMER' && orders.length > 0) {
      const ordersNeedingStatus = orders.filter(order => !order.paymentStatus);
      ordersNeedingStatus.forEach(order => {
        fetchPaymentStatusForOrder(order.id);
      });
    }
  }, [user, orders.length]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'shipped':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'processing':
      case 'pending':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'no_payment':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'unknown':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
      default:
        return 'text-gray-500 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const formatPaymentStatus = (order: Order) => {
    if (!order.paymentStatus) return "Loading...";

    let displayStatus = order.paymentStatus.replace(/_/g, ' ').toUpperCase();

    if (order.isCompleted && order.verifiedBy) {
      return `${displayStatus} ✓`;
    }

    return displayStatus;
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-gray-900 dark:text-gray-100">Your Order History</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Track your magnet orders and payment status verified by admin
            </CardDescription>
          </div>
          <Button
            onClick={refreshAllPaymentStatuses}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={Object.values(paymentStatusLoading).some(loading => loading)}
          >
            <RefreshCw className={`h-4 w-4 ${Object.values(paymentStatusLoading).some(loading => loading) ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-900 dark:text-gray-100">Order</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100">Items</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100">Total</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100">Date</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100">Payment</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-100">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {order.items}
                      </TableCell>
                      <TableCell className="font-medium text-green-600 dark:text-green-400">
                        {/* KSh {order.total.toLocaleString()} */}
                        {order.total
                        ? `Ksh ${order.total.toLocaleString()}`
                       : <span className="text-gray-500 dark:text-gray-400">N/A</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {paymentStatusLoading[order.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                          ) : (
                            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                              {formatPaymentStatus(order)}
                            </Badge>
                          )}
                          <Button
                            onClick={() => refreshPaymentStatus(order.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            disabled={paymentStatusLoading[order.id]}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => toggleOrderExpansion(order.id)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          {expandedOrders[order.id] ? 'Hide' : 'Details'}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {expandedOrders[order.id] && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-gray-50 dark:bg-gray-700/50">
                          <div className="p-4 space-y-3">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              Order Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              {order.trackingNumber && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Tracking Number:
                                  </span>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {order.trackingNumber}
                                  </p>
                                </div>
                              )}

                              {order.paymentMethod && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Payment Method:
                                  </span>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {order.paymentMethod}
                                  </p>
                                </div>
                              )}

                              {order.estimatedDelivery && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Estimated Delivery:
                                  </span>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                                  </p>
                                </div>
                              )}

                              {order.paymentId && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Payment ID:
                                  </span>
                                  <p className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                                    {order.paymentId}
                                  </p>
                                </div>
                              )}

                              {order.paymentAmount && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Payment Amount:
                                  </span>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    KSh {order.paymentAmount.toLocaleString()}
                                  </p>
                                </div>
                              )}

                              {order.paymentDate && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Payment Date:
                                  </span>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {new Date(order.paymentDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            {order.verifiedBy && (
                              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">
                                  ✅ Payment Verified by Admin
                                </h5>
                                <div className="text-sm text-green-700 dark:text-green-400">
                                  <p>Verified by: <span className="font-medium">{order.verifiedBy.admin_name}</span></p>
                                  <p>Verification Date: {new Date(order.verifiedBy.verification_date).toLocaleDateString()}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 dark:text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 dark:text-gray-300 mb-6">
              Start shopping to see your order history and track payments!
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Browse Magnets
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerOrders;
