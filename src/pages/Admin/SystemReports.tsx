import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: string;
  paymentMethod: string;
  customer?: string;
}

interface SystemReportsProps {
  allOrders: Order[];
  getStatusColor: (status: string) => string;
}

const SystemReports: React.FC<SystemReportsProps> = ({ allOrders, getStatusColor }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status Overview</CardTitle>
        <CardDescription>Current status of all orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4">
          {['delivered', 'shipped', 'processing', 'pending'].map((status) => {
            const count = allOrders.filter(order => order.status.toLowerCase() === status).length;
            return (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{status}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemReports;