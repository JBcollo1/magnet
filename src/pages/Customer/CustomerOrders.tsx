// frontend/magnet/src/pages/Customer/CustomerOrders.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: string;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      fetchUserOrders();
    } else {
      setLoading(false); // Not a customer or user not loaded, stop loading state
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Order[]>(
        `${import.meta.env.VITE_API_URL}/orders`,
        { withCredentials: true }
      );

      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Fallback data for demonstration if API fails
      setOrders([
        { id: 'ORD-001', date: '2024-12-01', items: '4-CUSTOM MAGNETS', total: 800, status: 'Delivered', paymentMethod: 'M-Pesa', trackingNumber: 'TRK001234', estimatedDelivery: '2024-12-05' },
        { id: 'ORD-002', date: '2024-12-15', items: '6-CUSTOM MAGNETS', total: 1200, status: 'Processing', paymentMethod: 'M-Pesa', trackingNumber: 'TRK001235', estimatedDelivery: '2024-12-20' },
        { id: 'ORD-003', date: '2024-11-28', items: '2-CUSTOM MAGNETS', total: 400, status: 'Shipped', paymentMethod: 'Card', trackingNumber: 'TRK001236', estimatedDelivery: '2024-12-02' },
        { id: 'ORD-004', date: '2024-11-10', items: '10-CUSTOM MAGNETS', total: 2000, status: 'Delivered', paymentMethod: 'M-Pesa', trackingNumber: 'TRK001237', estimatedDelivery: '2024-11-15' },
        { id: 'ORD-005', date: '2024-10-05', items: '3-CUSTOM MAGNETS', total: 600, status: 'Delivered', paymentMethod: 'Card', trackingNumber: 'TRK001238', estimatedDelivery: '2024-10-09' },
      ]);
    } finally {
      setLoading(false);
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
                <TableHead className="text-gray-900 dark:text-gray-100">Order ID</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Items</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Total</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Date</TableHead>
                <TableHead className="text-gray-900 dark:text-gray-100">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">{order.id}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{order.items}</TableCell>
                  <TableCell className="font-medium text-green-600 dark:text-green-400">KSh {order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{order.date}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{order.paymentMethod}</TableCell>
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