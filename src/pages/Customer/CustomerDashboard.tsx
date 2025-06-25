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
  onRefresh: () => Promise<void>;
}

const CustomerDashboard = ({ orders, onRefresh }: CustomerDashboardProps) => {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const totalItemsInCart = cartItems?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const recentOrders = orders.slice(0, 3);

  const handleRefresh = async () => {
    await onRefresh();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30';
      case 'shipped':
        return 'text-cyan-400 bg-cyan-900/30 border-cyan-500/30';
      case 'processing':
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';
      case 'cancelled':
        return 'text-red-400 bg-red-900/30 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-800/50 border-gray-600/30';
    }
  };

  const memberSinceDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : 'N/A';

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-2xl transition-all duration-300 bg-[#2D2D2D] border-[#303030] hover:border-[#00C896]/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E0E0E0]">
                Cart Items
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-[#00C896]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00C896]">
                {totalItemsInCart}
              </div>
              <p className="text-xs text-gray-400">Items ready to order</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 bg-[#2D2D2D] border-[#303030] hover:border-[#00C896]/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E0E0E0]">
                Total Orders
              </CardTitle>
              <Package className="h-4 w-4 text-[#00C896]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00C896]">{orders.length}</div>
              <p className="text-xs text-gray-400">Orders completed</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 bg-[#2D2D2D] border-[#303030] hover:border-[#00C896]/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E0E0E0]">
                Total Spent
              </CardTitle>
              <Star className="h-4 w-4 text-[#00C896]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00C896]">
                KSh {totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">Lifetime value</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 bg-[#2D2D2D] border-[#303030] hover:border-[#00C896]/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E0E0E0]">
                Account Status
              </CardTitle>
              <User className="h-4 w-4 text-[#00C896]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00C896]">Active</div>
              <p className="text-xs text-gray-400">
                Member since {memberSinceDate}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleRefresh}
            className="bg-[#00BFA6] hover:bg-[#1DB954] text-white border-none transition-all duration-300 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <Card className="bg-[#2D2D2D] border-[#303030]">
            <CardHeader>
              <CardTitle className="text-[#E0E0E0]">Recent Orders</CardTitle>
              <CardDescription className="text-gray-400">
                Your latest magnet orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-[#121212] rounded-lg hover:bg-[#1A1A1A] transition-all duration-300 border border-[#303030] hover:border-[#00C896]/30"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-lg text-[#E0E0E0]">{order.id}</p>
                      <p className="text-sm text-gray-400">{order.items}</p>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg text-[#E0E0E0]">
                        {order.total
                          ? `KSh ${order.total.toLocaleString()}`
                          : <span className="text-gray-500">N/A</span>}
                      </p>
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={() => navigate('/dashboard?tab=orders')}
                  variant="link"
                  className="mt-4 text-[#00C896] hover:text-[#1DB954] hover:no-underline px-0 transition-colors duration-300"
                >
                  View All Orders &rarr;
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-[#2D2D2D] border-[#303030]">
          <CardHeader>
            <CardTitle className="text-[#E0E0E0]">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Common tasks and helpful links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate('/')}
                className="h-auto py-6 flex flex-col bg-[#121212] hover:bg-[#1A1A1A] border-[#303030] hover:border-[#00C896]/50 text-[#E0E0E0] transition-all duration-300"
                variant="outline"
              >
                <ShoppingBag className="h-8 w-8 mb-2 text-[#00C896]" />
                <span>Shop Magnets</span>
              </Button>
              <Button
                onClick={() => navigate('/cart')}
                className="h-auto py-6 flex flex-col bg-[#121212] hover:bg-[#1A1A1A] border-[#303030] hover:border-[#00C896]/50 text-[#E0E0E0] transition-all duration-300"
                variant="outline"
              >
                <Star className="h-8 w-8 mb-2 text-[#00C896]" />
                <span>View Cart ({totalItemsInCart})</span>
              </Button>
              <Button
                onClick={() => navigate('/contact')}
                className="h-auto py-6 flex flex-col bg-[#121212] hover:bg-[#1A1A1A] border-[#303030] hover:border-[#00C896]/50 text-[#E0E0E0] transition-all duration-300"
                variant="outline"
              >
                <Heart className="h-8 w-8 mb-2 text-[#00C896]" />
                <span>Contact Support</span>
              </Button>
              <Button
                onClick={() => navigate('/about')}
                className="h-auto py-6 flex flex-col bg-[#121212] hover:bg-[#1A1A1A] border-[#303030] hover:border-[#00C896]/50 text-[#E0E0E0] transition-all duration-300"
                variant="outline"
              >
                <Gift className="h-8 w-8 mb-2 text-[#00C896]" />
                <span>Gift Cards</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
