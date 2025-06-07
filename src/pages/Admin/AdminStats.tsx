import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Users, DollarSign } from 'lucide-react';

interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: string;
  paymentMethod: string;
  customer?: string;
}

interface AdminStatsProps {
  allOrders: Order[];
}

const AdminStats: React.FC<AdminStatsProps> = ({ allOrders }) => {
  const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
  const totalCustomers = allOrders.reduce((acc, order) => {
    if (order.customer && !acc.includes(order.customer)) {
      acc.push(order.customer);
    }
    return acc;
  }, [] as string[]).length;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            KSh {totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">All time revenue</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{allOrders.length}</div>
          <p className="text-xs text-muted-foreground">All orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">Unique customers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            KSh {allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length).toLocaleString() : '0'}
          </div>
          <p className="text-xs text-muted-foreground">Per order value</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;