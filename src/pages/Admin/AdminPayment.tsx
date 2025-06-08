import React, { useState, useEffect } from 'react';
import {
  Loader2,
  CreditCard,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react';

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

interface AdminPaymentProps {
  allOrders: Order[];
  fetchAdminData: () => Promise<void>;
}

const AdminPayment: React.FC<AdminPaymentProps> = ({ allOrders, fetchAdminData }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    setFilteredPayments(derivedPayments);
  }, [allOrders]);

  useEffect(() => {
    let filtered = payments;

    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status.toLowerCase() === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchQuery, statusFilter]);

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'refunded': return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <RefreshCw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'M-Pesa': return <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">M</div>;
      case 'Card': return <CreditCard className="w-5 h-5 text-blue-500" />;
      default: return <DollarSign className="w-5 h-5 text-gray-500" />;
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
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedPayments = payments.map(p =>
        p.id === selectedPayment.id ? { ...p, status: newPaymentStatus as any } : p
      );
      setPayments(updatedPayments);
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`M-Pesa Transaction Status for ${transactionId}: Verified`);
    } catch (error) {
      console.error('Failed to check M-Pesa status:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalPayments: payments.length,
    completedPayments: payments.filter(p => p.status === 'Completed').length,
    pendingPayments: payments.filter(p => p.status === 'Pending').length,
    totalRevenue: payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Payment Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Monitor and manage all payment transactions with ease
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPayments}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All transactions</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl">
                <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedPayments}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+12% this month</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingPayments}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Needs attention</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-2xl">
                <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  KSh {stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">+8% this month</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Payment Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80 p-6 border-b border-gray-200/50 dark:border-gray-600/50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Payment Transactions
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Manage and verify payment statuses across all orders
                </p>
              </div>
              <div className="flex gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full lg:w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Method</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {filteredPayments.map((payment, index) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">
                        {payment.orderId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                          {payment.customerEmail.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {payment.customerEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {payment.customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        KSh {payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.method)}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {payment.method}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {payment.transactionId || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end opacity-60 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => handleVerifyClick(payment)}
                          className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-all duration-200 text-gray-700 dark:text-gray-300"
                        >
                          <Eye className="w-4 h-4" />
                          Verify
                        </button>
                        {payment.method === 'M-Pesa' && payment.transactionId && (
                          <button
                            onClick={() => handleCheckMpesaStatus(payment.transactionId!)}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-1 text-sm border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 text-green-700 dark:text-green-300 disabled:opacity-50"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                            Check
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayment;
