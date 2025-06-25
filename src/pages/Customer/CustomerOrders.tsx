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
  }, [user, orders.length, orders]); // Added 'orders' to dependency array for completeness

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'shipped':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30';
      case 'no_payment':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30';
      case 'unknown':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30';
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
    <Card className="bg-white border-gray-200 shadow-lg transition-all duration-300 hover:border-gray-300
                     dark:bg-[#2D2D2D] dark:border-[#303030] dark:hover:border-[#00C896]/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-gray-900 text-xl font-semibold dark:text-[#E0E0E0]">Your Order History</CardTitle>
            <CardDescription className="text-gray-600 mt-1 dark:text-gray-400">
              Track your magnet orders and payment status verified by admin
            </CardDescription>
          </div>
          <Button
            onClick={refreshAllPaymentStatuses}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white border-gray-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400 transition-all duration-300
                       dark:bg-transparent dark:border-[#303030] dark:text-[#00C896] dark:hover:bg-[#00C896]/10 dark:hover:border-[#00C896]"
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
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[#303030]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-200 dark:bg-[#1A1A1A] dark:hover:bg-[#1A1A1A] dark:border-b dark:border-[#303030]">
                    <TableHead className="text-gray-700 font-medium dark:text-[#E0E0E0]">Order</TableHead>
                    <TableHead className="text-gray-700 font-medium dark:text-[#E0E0E0]">Items</TableHead>
                    <TableHead className="text-gray-700 font-medium dark:text-[#E0E0E0]">Total</TableHead>
                    <TableHead className="text-gray-700 font-medium dark:text-[#E0E0E0]">Status</TableHead>
                    <TableHead className="text-gray-700 font-medium dark:text-[#E0E0E0]">Date</TableHead>
                    <TableHead className="text-gray-700 font-medium dark:text-[#E0E0E0]">Payment</TableHead>
                    <TableHead className="text-gray-700 font-medium dark:text-[#E0E0E0]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow className="bg-white hover:bg-gray-50 border-b border-gray-200 transition-colors duration-200
                                         dark:bg-[#2D2D2D] dark:hover:bg-[#1A1A1A] dark:border-b dark:border-[#303030] dark:transition-colors dark:duration-200">
                        <TableCell className="font-medium text-gray-900 dark:text-[#E0E0E0]">
                          {order.order_number}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-300">
                          {order.items}
                        </TableCell>
                        <TableCell className="font-medium text-teal-700 dark:text-[#00C896]">
                          {order.total
                            ? `Ksh ${order.total.toLocaleString()}`
                            : <span className="text-gray-500">N/A</span>}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(order.status)} font-medium`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-300">
                          {new Date(order.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {paymentStatusLoading[order.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin text-teal-600 dark:text-[#00C896]" />
                            ) : (
                              <Badge className={`${getPaymentStatusColor(order.paymentStatus)} font-medium`}>
                                {formatPaymentStatus(order)}
                              </Badge>
                            )}
                            <Button
                              onClick={() => refreshPaymentStatus(order.id)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-200
                                         dark:text-gray-400 dark:hover:text-[#00C896] dark:hover:bg-[#00C896]/10"
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
                            className="flex items-center gap-1 text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-200
                                       dark:text-gray-400 dark:hover:text-[#00C896] dark:hover:bg-[#00C896]/10"
                          >
                            <Eye className="h-4 w-4" />
                            {expandedOrders[order.id] ? 'Hide' : 'Details'}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedOrders[order.id] && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-gray-50 border-b border-gray-200 dark:bg-[#1A1A1A] dark:border-b dark:border-[#303030]">
                            <div className="p-4 space-y-3">
                              <h4 className="font-semibold text-gray-900 text-lg dark:text-[#E0E0E0]">
                                Order Details
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                {order.trackingNumber && (
                                  <div className="bg-white p-3 rounded-lg border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
                                    <span className="font-medium text-gray-700 block mb-1 dark:text-gray-300">
                                      Tracking Number:
                                    </span>
                                    <p className="text-teal-600 font-mono dark:text-[#00C896]">
                                      {order.trackingNumber}
                                    </p>
                                  </div>
                                )}
                                {order.paymentMethod && (
                                  <div className="bg-white p-3 rounded-lg border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
                                    <span className="font-medium text-gray-700 block mb-1 dark:text-gray-300">
                                      Payment Method:
                                    </span>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      {order.paymentMethod}
                                    </p>
                                  </div>
                                )}
                                {order.estimatedDelivery && (
                                  <div className="bg-white p-3 rounded-lg border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
                                    <span className="font-medium text-gray-700 block mb-1 dark:text-gray-300">
                                      Estimated Delivery:
                                    </span>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                                {order.paymentId && (
                                  <div className="bg-white p-3 rounded-lg border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
                                    <span className="font-medium text-gray-700 block mb-1 dark:text-gray-300">
                                      Payment ID:
                                    </span>
                                    <p className="text-teal-600 font-mono text-xs break-all dark:text-[#00C896]">
                                      {order.paymentId}
                                    </p>
                                  </div>
                                )}
                                {order.paymentAmount && (
                                  <div className="bg-white p-3 rounded-lg border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
                                    <span className="font-medium text-gray-700 block mb-1 dark:text-gray-300">
                                      Payment Amount:
                                    </span>
                                    <p className="text-teal-600 font-semibold dark:text-[#00C896]">
                                      KSh {order.paymentAmount.toLocaleString()}
                                    </p>
                                  </div>
                                )}
                                {order.paymentDate && (
                                  <div className="bg-white p-3 rounded-lg border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
                                    <span className="font-medium text-gray-700 block mb-1 dark:text-gray-300">
                                      Payment Date:
                                    </span>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      {new Date(order.paymentDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {order.verifiedBy && (
                                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-emerald-500/10 dark:border-emerald-500/20">
                                  <h5 className="font-medium text-emerald-700 mb-2 flex items-center gap-2 dark:text-emerald-300">
                                    <span className="text-emerald-500 dark:text-emerald-400">✅</span>
                                    Payment Verified by Admin
                                  </h5>
                                  <div className="text-sm text-emerald-600 space-y-1 dark:text-emerald-200">
                                    <p>
                                      <span className="text-gray-700 dark:text-gray-400">Verified by:</span>{' '}
                                      <span className="font-medium text-emerald-700 dark:text-emerald-300">{order.verifiedBy.admin_name}</span>
                                    </p>
                                    <p>
                                      <span className="text-gray-700 dark:text-gray-400">Verification Date:</span>{' '}
                                      <span className="text-emerald-700 dark:text-emerald-300">{new Date(order.verifiedBy.verification_date).toLocaleDateString()}</span>
                                    </p>
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
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 max-w-md mx-auto
                            dark:bg-[#1A1A1A] dark:border-[#303030]">
              <Package className="h-16 w-16 text-teal-600 mx-auto mb-4 dark:text-[#00C896]" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-[#E0E0E0]">
                No orders yet
              </h3>
              <p className="text-gray-600 mb-6 dark:text-gray-400">
                Start shopping to see your order history and track payments!
              </p>
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105
                           dark:bg-[#00BFA6] dark:hover:bg-[#1DB954] dark:text-[#121212]"
              >
                Browse Magnets
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerOrders;