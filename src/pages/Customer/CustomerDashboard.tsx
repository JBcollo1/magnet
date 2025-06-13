import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Star, Package, User, Heart, Gift, RefreshCw } from 'lucide-react';

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

interface CustomerDashboardProps {
  orders: Order[];
  onRefresh: () => Promise<void>; // Added onRefresh prop
}

const CustomerDashboard = ({ orders, onRefresh }: CustomerDashboardProps) => {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const totalItemsInCart = cartItems?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const recentOrders = orders.slice(0, 3); // Show only 3 recent orders

  const handleRefresh = async () => {
    await onRefresh(); // Call the onRefresh function
  };

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
        return 'text-gray-600 bg-gray-100 dark:text-gray-100';
    }
  };

  // Format the member since date
  const memberSinceDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : 'N/A';

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Cart Items
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalItemsInCart}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Items ready to order</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Total Orders
            </CardTitle>
            <Package className="h-4 w-4 text-gray-500 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{orders.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Orders completed</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Total Spent
            </CardTitle>
            <Star className="h-4 w-4 text-gray-500 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              KSh {totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Lifetime value</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Account Status
            </CardTitle>
            <User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Active</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Member since {memberSinceDate}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Recent Orders Preview */}
      {recentOrders.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Recent Orders</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Your latest magnet orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-lg text-gray-900 dark:text-gray-100">{order.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{order.items}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg text-gray-900 dark:text-gray-100">
                      KSh {order.total.toLocaleString()}
                    </p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => navigate('/dashboard?tab=orders')}
              variant="link"
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline px-0"
            >
              View All Orders &rarr;
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Common tasks and helpful links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="h-auto py-4 flex flex-col hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              <ShoppingBag className="h-8 w-8 mb-2 text-purple-600 dark:text-purple-400" />
              <span>Shop Magnets</span>
            </Button>
            <Button
              onClick={() => navigate('/cart')}
              variant="outline"
              className="h-auto py-4 flex flex-col hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              <Star className="h-8 w-8 mb-2 text-blue-600 dark:text-blue-400" />
              <span>View Cart ({totalItemsInCart})</span>
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              variant="outline"
              className="h-auto py-4 flex flex-col hover:bg-green-50 dark:hover:bg-green-900/20 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              <Heart className="h-8 w-8 mb-2 text-green-600 dark:text-green-400" />
              <span>Contact Support</span>
            </Button>
            <Button
              onClick={() => navigate('/about')}
              variant="outline"
              className="h-auto py-4 flex flex-col hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              <Gift className="h-8 w-8 mb-2 text-orange-600 dark:text-orange-400" />
              <span>Gift Cards</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
