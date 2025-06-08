import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Loader2,
  CreditCard,
  Search,
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
  fetchAdminData: () => Promise<void>;
}

const AdminPayment: React.FC<AdminPaymentProps> = ({ fetchAdminData }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get<{ payments: Payment[] }>(`${import.meta.env.VITE_API_URL}/admin/payments`, {
          withCredentials: true
        });
        setPayments(response.data.payments);
        setFilteredPayments(response.data.payments);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    fetchPayments();
  }, []);

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
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'refunded': return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'failed': return <XCircle className="w-3 h-3" />;
      case 'refunded': return <RefreshCw className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'M-Pesa': return <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">M</div>;
      case 'Card': return <CreditCard className="w-4 h-4 text-blue-500" />;
      default: return <DollarSign className="w-4 h-4 text-gray-500" />;
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
        `${import.meta.env.VITE_API_URL}/payments/${selectedPayment.id}/verify`,
        { status: newPaymentStatus },
        { withCredentials: true }
      );

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
      await axios.get(
        `${import.meta.env.VITE_API_URL}/payments/mpesa/verify?transactionId=${transactionId}`,
        { withCredentials: true }
      );
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
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Payment Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor and manage all payment transactions with ease
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-900 dark:text-blue-300">Total Payments</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{stats.totalPayments}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-900 dark:text-green-300">Completed</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">{stats.completedPayments}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-900 dark:text-amber-300">Pending</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{stats.pendingPayments}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-900 dark:text-purple-300">Total Revenue</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
                KSh {stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-600 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Payment Transactions
              </h2>
              <p className="text-muted-foreground text-xs">
                Manage and verify payment statuses across all orders
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary/20 w-full sm:w-auto text-xs h-7"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary/20 text-xs h-7"
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-150 dark:hover:from-gray-600 dark:hover:to-gray-550">
                <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left text-xs">
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Order ID
                  </div>
                </th>
                <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left text-xs">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Customer
                  </div>
                </th>
                <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Amount
                  </div>
                </th>
                <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left text-xs">
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Method
                  </div>
                </th>
                <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Transaction ID
                  </div>
                </th>
                <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Date
                  </div>
                </th>
                <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Status
                  </div>
                </th>
                <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-right text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, index) => (
                <tr
                  key={payment.id}
                  className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750/30'}`}
                >
                  <td className="py-2 px-3">
                    <div className="font-medium text-blue-700 dark:text-blue-400 text-xs">
                      {payment.orderId}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg">
                        {payment.customerEmail.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {payment.customerEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.customerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-xs font-bold text-green-700 dark:text-green-400">
                      KSh {payment.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      {getMethodIcon(payment.method)}
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {payment.method}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {payment.transactionId || 'N/A'}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-xs text-gray-700 dark:text-gray-300">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleVerifyClick(payment)}
                        className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      {payment.method === 'M-Pesa' && payment.transactionId && (
                        <button
                          onClick={() => handleCheckMpesaStatus(payment.transactionId!)}
                          disabled={loading}
                          className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                        >
                          {loading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
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
  );
};

export default AdminPayment;
