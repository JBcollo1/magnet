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

// Define the interfaces
interface Order {
  id: string;
  // Add other properties of Order as needed
}

interface OrderInfo {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  status: string; 
}

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  mpesa_code: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  phone_number: string;
  payment_date: string;
  order_info: OrderInfo;
}

interface AdminPaymentProps {
  allOrders: Order[];
  fetchAdminData: () => void;
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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Mock data updated to match the new interface
  const mockPayments: Payment[] = [
    {
      id: '1',
      order_id: 'ORD-001',
      amount: 1500,
      mpesa_code: 'MP12345678',
      status: 'Pending',
      phone_number: '+254712345678',
      payment_date: '2023-10-01T10:30:00Z',
      order_info: {
        order_number: 'ORD-001',
        customer_name: 'John Doe',
        customer_phone: '+254712345678',
        status: "fe"
      }
    },
    {
      id: '2',
      order_id: 'ORD-002',
      amount: 2700,
      mpesa_code: 'MP98765432',
      status: 'Completed',
      phone_number: '+254723456789',
      payment_date: '2023-10-02T14:20:00Z',
      order_info: {
        order_number: 'ORD-002',
        customer_name: 'Jane Smith',
        customer_phone: '+254723456789',
        status: "fe"
      }
    },
    {
      id: '3',
      order_id: 'ORD-003',
      amount: 3200,
      mpesa_code: 'MP56789012',
      status: 'Failed',
      phone_number: '+254734567890',
      payment_date: '2023-10-03T09:15:00Z',
      order_info: {
        order_number: 'ORD-003',
        customer_name: 'Mike Johnson',
        customer_phone: '+254734567890',
        status: "fe"
      }
    },
    {
      id: '4',
      order_id: 'ORD-004',
      amount: 500,
      mpesa_code: 'MP87654321',
      status: 'Pending',
      phone_number: '+254745678901',
      payment_date: '2023-09-25T16:45:00Z',
      order_info: {
        order_number: 'ORD-004',
        customer_name: 'Alice Brown',
        customer_phone: '+254745678901',
        status:"fe"
      }
    },
    {
      id: '5',
      order_id: 'ORD-005',
      amount: 1200,
      mpesa_code: 'MP11223344',
      status: 'Pending',
      phone_number: '+254756789012',
      payment_date: '2023-10-05T11:30:00Z',
      order_info: {
        order_number: 'ORD-005',
        customer_name: 'Bob Wilson',
        customer_phone: '+254756789012',
        status: "fe"
      }
    }
  ];

  // Function to determine whether to use mock data or real API
  const USE_MOCK_DATA = !import.meta.env?.VITE_API_URL;

  // Function to fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        console.log("Using mock data for payments.");
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setPayments(mockPayments);
        setFilteredPayments(mockPayments);
      } else {
        console.log("Attempting to fetch payments from backend.");
        const response = await axios.get<{ payments: Payment[] }>(`${import.meta.env.VITE_API_URL}/admin/payments`, {
          withCredentials: true
        });
        if (response.data.payments && response.data.payments.length > 0) {
          setPayments(response.data.payments);
          setFilteredPayments(response.data.payments);
        } else {
          setPayments(mockPayments);
          setFilteredPayments(mockPayments);
          console.warn("Backend returned no payments or invalid data, using mock data.");
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError("Failed to fetch payments from backend. Using mock data.");
      setPayments(mockPayments);
      setFilteredPayments(mockPayments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;

  if (searchQuery) {
    filtered = filtered.filter(payment =>
      payment.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.mpesa_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.phone_number.includes(searchQuery) ||
      payment.order_info?.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.order_info?.order_number?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleVerifyClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setNewPaymentStatus(payment.status);
    setIsVerifyDialogOpen(true);
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedPayment) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800));

        const updatedPayments = payments.map(p =>
          p.id === selectedPayment.id ? { ...p, status: newPaymentStatus as Payment['status'] } : p
        );
        setPayments(updatedPayments);
        setSuccessMessage(`Payment ${selectedPayment.order_id} status updated to ${newPaymentStatus} (mock data).`);
      } else {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/payments/${selectedPayment.id}/verify`,
          { status: newPaymentStatus },
          { withCredentials: true }
        );

        if (response.status === 200) {
          const updatedPayments = payments.map(p =>
            p.id === selectedPayment.id ? { ...p, status: newPaymentStatus as Payment['status'] } : p
          );
          setPayments(updatedPayments);
          setSuccessMessage(`Payment ${selectedPayment.order_id} status updated to ${newPaymentStatus} (backend).`);
        } else {
          throw new Error('Failed to update payment status on backend.');
        }
      }
      setIsVerifyDialogOpen(false);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      setError("Failed to update payment status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckMpesaStatus = async (paymentId: string, mpesaCode: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        let newStatus: Payment['status'] = 'Failed';
        let message = `M-Pesa Transaction Status for ${mpesaCode}: Not found.`;

        if (mpesaCode === 'MP12345678' || mpesaCode === 'MP87654321') {
          newStatus = 'Completed';
          message = `M-Pesa Transaction Status for ${mpesaCode}: Verified successfully! (mock data)`;
        } else {
          newStatus = 'Failed';
          message = `M-Pesa Transaction Status for ${mpesaCode}: Verification failed. (mock data)`;
        }

        const updatedPayments = payments.map(p =>
          p.id === paymentId ? { ...p, status: newStatus } : p
        );
        setPayments(updatedPayments);
        setSuccessMessage(message);
      } else {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/payments/mpesa/verify?transactionId=${mpesaCode}`,
          { withCredentials: true }
        );

        const data = response.data as { status: Payment['status'] };
        if (response.status === 200 && data.status) {
          const receivedStatus = data.status;
          const updatedPayments = payments.map(p =>
            p.id === paymentId ? { ...p, status: receivedStatus } : p
          );
          setPayments(updatedPayments);
          setSuccessMessage(`M-Pesa Transaction Status for ${mpesaCode}: ${receivedStatus} (backend).`);
        } else {
          throw new Error('M-Pesa verification failed or returned unexpected data.');
        }
      }
    } catch (error) {
      console.error('Failed to check M-Pesa status:', error);
      setError("Failed to verify M-Pesa transaction. Please check the transaction ID or network.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getCustomerInfo = (payment: Payment) => {
    if (payment.order_info ) {
      return {
        name: payment.order_info.customer_name,
        phone: payment.order_info.customer_phone
      };
    }
    return {
      name: 'Unknown Customer',
      phone: payment.phone_number
    };
  };

  const stats = {
    totalPayments: payments.length,
    completedPayments: payments.filter(p => p.status === 'Completed').length,
    pendingPayments: payments.filter(p => p.status === 'Pending').length,
    totalRevenue: payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Payment Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor and manage all payment transactions with ease {USE_MOCK_DATA && <span className="font-semibold text-blue-500">(Using Mock Data)</span>}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-3 py-2 cursor-pointer" onClick={() => setError(null)}>
            <XCircle className="h-4 w-4" />
          </span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-3 py-2 cursor-pointer" onClick={() => setSuccessMessage(null)}>
            <CheckCircle className="h-4 w-4" />
          </span>
        </div>
      )}

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
                  className="pl-7 pr-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:border-primary focus:ring-1 focus:ring-primary/20 w-full sm:w-auto text-xs h-8"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs h-8"
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
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
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
                    M-Pesa Code
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
              {filteredPayments.map((payment, index) => {
                const customerInfo = getCustomerInfo(payment);
                return (
                  <tr
                    key={payment.id}
                    className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750/30'}`}
                  >
                    <td className="py-2 px-3">
                      <div className="font-medium text-blue-700 dark:text-blue-400 text-xs">
                        {payment.order_id}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg">
                          {customerInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {customerInfo.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {customerInfo.phone}
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
                      <div className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {payment.mpesa_code || 'N/A'}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-xs text-gray-700 dark:text-gray-300">
                        {formatDate(payment.payment_date)}
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
                          className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors rounded-sm flex items-center justify-center"
                          title="Edit Payment Status"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        {payment.mpesa_code && (
                          <button
                            onClick={() => handleCheckMpesaStatus(payment.id, payment.mpesa_code)}
                            disabled={loading}
                            className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors rounded-sm flex items-center justify-center"
                            title="Verify M-Pesa Transaction"
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Dialog/Modal */}
      {isVerifyDialogOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Payment for Order: {selectedPayment.order_id}</h3>
            <div className="mb-4">
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Customer:</strong> {getCustomerInfo(selectedPayment).name}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Phone:</strong> {getCustomerInfo(selectedPayment).phone}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Amount:</strong> KSh {selectedPayment.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>M-Pesa Code:</strong> {selectedPayment.mpesa_code}
                </p>
              </div>
             <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Update the payment status for this transaction:
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Status
              </label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsVerifyDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePaymentStatus}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredPayments.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-600 mb-2">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {searchQuery || statusFilter !== 'all' 
              ? 'No payments found matching your search criteria.' 
              : 'No payments available yet.'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading payments...</span>
        </div>
      )}
    </div>
  );
};

export default AdminPayment;