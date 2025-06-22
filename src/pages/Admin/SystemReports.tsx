import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Package, FileText, Download, Mail, Calendar, BarChart3, PieChart as PieChartIcon,
  Plus, Eye, Send, Loader2, AlertCircle, CheckCircle, TrendingUp, TrendingDown,
  DollarSign, ShoppingCart, Activity, Clock, Filter, RefreshCw
} from 'lucide-react';

// Define the Order interface
interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  custom_images: boolean;
  created_at: string;
}
interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  city: string | null;
  pickup_point_id: string | null;
  pickup_point: string | null;
  order_notes: string | null;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  order_items: OrderItem[];
}

// Interface for a single report object received from the backend
interface Report {
  id: string;
  report_name: string;
  start_date: string | null;
  end_date: string | null;
  total_orders: number;
  total_revenue: number;
  generated_at: string;
}

// Interface for pagination data
interface Pagination {
  total: number;
  pages: number;
  currentPage: number;
}

// Props for the main SystemReports component
interface SystemReportsProps {
  allOrders: Order[];
  getStatusColor: (status: string) => string;
}

// Report API Integration
const reportAPI = {
  generateReport: async (reportData: { reportName: string; startDate: string | null; endDate: string | null }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/reports`, {
        report_name: reportData.reportName,
        start_date: reportData.startDate,
        end_date: reportData.endDate
      }, { withCredentials: true });

      return {
        success: response.status === 200 || response.status === 201,
        data: response.data,
        message: (response.data as any).message || 'Report generated successfully'
      };
    } catch (error: any) {
      console.error('Error generating report:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate report',
        error: error.message
      };
    }
  },

  getAllReports: async (page: number = 1, perPage: number = 10) => {
    try {
      interface GetAllReportsResponse {
        reports: Report[];
        pagination?: {
          total: number;
          pages: number;
          current_page: number;
        };
        message?: string;
      }

      const response = await axios.get<GetAllReportsResponse>(
        `${import.meta.env.VITE_API_URL}/admin/reports?page=${page}&per_page=${perPage}`,
        { withCredentials: true }
      );

      return {
        success: response.status === 200,
        reports: response.data.reports || [],
        pagination: response.data.pagination ? {
          total: response.data.pagination.total,
          pages: response.data.pagination.pages,
          currentPage: response.data.pagination.current_page
        } : null,
        message: response.data.message || 'Reports fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred while fetching reports',
        reports: [],
        pagination: null,
        error: error.message
      };
    }
  },

  downloadReportPDF: async (reportId: string, reportName: string = 'report') => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/download`, {
        withCredentials: true,
        responseType: 'blob'
      });

      if (response.status !== 200) {
        throw new Error('Failed to download report');
      }

      const blob = new Blob([response.data as BlobPart], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportName}_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Report downloaded successfully' };
    } catch (error: any) {
      console.error('Error downloading report:', error);
      return { success: false, message: error.response?.data?.message || error.message || 'Failed to download report' };
    }
  },

  sendReportEmail: async (reportId: string, emailData: { recipientEmail: string; senderEmail?: string }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/email`, {
        recipient_email: emailData.recipientEmail,
        sender_email: emailData.senderEmail
      }, { withCredentials: true });

      return {
        success: response.status === 200,
        data: response.data,
        message: (response.data as any).message || 'Email sent successfully'
      };
    } catch (error: any) {
      console.error('Error sending email:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send email',
        error: error.message
      };
    }
  },

  downloadChart: async (reportId: string, chartType: 'revenue' | 'products', reportName: string = 'chart') => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/charts/${chartType}`, {
        withCredentials: true,
        responseType: 'blob'
      });

      if (response.status !== 200) {
        throw new Error(`Failed to download ${chartType} chart`);
      }

      const blob = new Blob([response.data as BlobPart], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartType}_chart_${reportName}_${reportId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: `${chartType} chart downloaded successfully` };
    } catch (error: any) {
      console.error('Error downloading chart:', error);
      return { success: false, message: error.response?.data?.message || error.message || `Failed to download ${chartType} chart` };
    }
  }
};

const mockRevenueData = [
  { month: 'Jan', revenue: 45000, orders: 180, avgOrder: 250 },
  { month: 'Feb', revenue: 52000, orders: 210, avgOrder: 248 },
  { month: 'Mar', revenue: 48000, orders: 195, avgOrder: 246 },
  { month: 'Apr', revenue: 61000, orders: 240, avgOrder: 254 },
  { month: 'May', revenue: 55000, orders: 220, avgOrder: 250 },
  { month: 'Jun', revenue: 67000, orders: 270, avgOrder: 248 },
];

const mockProductData = [
  { name: 'Product A', value: 35, sales: 1250 },
  { name: 'Product B', value: 25, sales: 950 },
  { name: 'Product C', value: 20, sales: 800 },
  { name: 'Product D', value: 12, sales: 450 },
  { name: 'Product E', value: 8, sales: 300 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const MetricCard = ({ title, value, change, icon: Icon, trend, color = 'blue' }) => (
  <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
    <div className={`absolute inset-0 bg-gradient-to-r from-${color}-500/5 to-${color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 text-sm ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {change}% from last month
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status, getStatusColor }) => {
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { color: getStatusColor(status), icon: CheckCircle };
      case 'shipped':
        return { color: getStatusColor(status), icon: Package };
      case 'processing':
        return { color: getStatusColor(status), icon: Clock };
      case 'pending':
        return { color: getStatusColor(status), icon: AlertCircle };
      default:
        return { color: getStatusColor(status), icon: AlertCircle };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge className={`${config.color} border flex items-center gap-1 px-2 py-1`}>
      <IconComponent className="w-3 h-3" />
      {status}
    </Badge>
  );
};

const ReportsAnalytics = ({ allOrders, getStatusColor }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value="KSh 328,000"
          change={12.5}
          trend="up"
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Total Orders"
          value="1,235"
          change={8.2}
          trend="up"
          icon={ShoppingCart}
          color="blue"
        />
        <MetricCard
          title="Average Order Value"
          value="KSh 249"
          change={-3.1}
          trend="down"
          icon={BarChart3}
          color="purple"
        />
        <MetricCard
          title="Active Customers"
          value="847"
          change={15.3}
          trend="up"
          icon={Users}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <TrendingUp className="w-5 h-5 mr-2" />
              Revenue & Orders Trend
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Monthly performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={mockRevenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: 'black'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <PieChartIcon className="w-5 h-5 mr-2" />
              Product Performance
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Sales distribution by product</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={mockProductData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockProductData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value}%`,
                    `KSh ${props.payload.sales}`
                  ]}
                  labelFormatter={(label) => `Product: ${label}`}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Package className="w-5 h-5 mr-2" />
                Recent Orders
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">Latest order activities and transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-gray-700">
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Order ID</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Customer</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Items</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Total</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <TableCell className="font-mono text-sm text-gray-900 dark:text-gray-100">#{order.id}</TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">{order.customer}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate text-gray-700 dark:text-gray-300">{order.items}</TableCell>
                    <TableCell className="font-semibold text-green-600 dark:text-green-400">
                      KSh {order.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} getStatusColor={getStatusColor} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        {order.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ReportManagement = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [emailModal, setEmailModal] = useState<{ show: boolean; reportId: string | null; reportName: string }>({ show: false, reportId: null, reportName: '' });

  const [reportForm, setReportForm] = useState({
    reportName: '',
    startDate: '',
    endDate: ''
  });

  const [emailForm, setEmailForm] = useState({
    recipientEmail: '',
    senderEmail: ''
  });

  useEffect(() => {
    loadReports();
  }, [currentPage]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const result = await reportAPI.getAllReports(currentPage, 10);

    if (result.success) {
      setReports(result.reports);
      setPagination(result.pagination);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.reportName.trim()) {
      setError('Report name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formattedData = {
      reportName: reportForm.reportName,
      startDate: reportForm.startDate ? new Date(reportForm.startDate).toISOString() : null,
      endDate: reportForm.endDate ? new Date(reportForm.endDate).toISOString() : null
    };

    const result = await reportAPI.generateReport(formattedData);

    if (result.success) {
      setSuccess(result.message);
      setShowGenerateForm(false);
      setReportForm({ reportName: '', startDate: '', endDate: '' });
      loadReports();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleDownloadPDF = async (reportId: string, reportName: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    const result = await reportAPI.downloadReportPDF(reportId, reportName);

    if (result.success) {
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleDownloadChart = async (reportId: string, chartType: 'revenue' | 'products', reportName: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    const result = await reportAPI.downloadChart(reportId, chartType, reportName);

    if (result.success) {
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.recipientEmail.trim()) {
      setError('Recipient email is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    const result = await reportAPI.sendReportEmail(emailModal.reportId!, emailForm);

    if (result.success) {
      setSuccess(`Report sent successfully to ${emailForm.recipientEmail}`);
      setEmailModal({ show: false, reportId: null, reportName: '' });
      setEmailForm({ recipientEmail: '', senderEmail: '' });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/30">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/30">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      <Card className="border-l-4 border-l-blue-500 bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <FileText className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                Generate New Report
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Create comprehensive sales and analytics reports with custom date ranges
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowGenerateForm(!showGenerateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </CardHeader>

        {showGenerateForm && (
          <CardContent className="bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
            <form onSubmit={handleGenerateReport} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="reportName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Report Name *
                  </Label>
                  <Input
                    id="reportName"
                    value={reportForm.reportName}
                    onChange={(e) => setReportForm({ ...reportForm, reportName: e.target.value })}
                    placeholder="e.g., Monthly Sales Report"
                    className="mt-1 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={reportForm.startDate}
                    onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                    className="mt-1 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                    className="mt-1 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Generate Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenerateForm(false)}
                  disabled={loading}
                  className="px-6 bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Generated Reports</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            View, download, and manage all generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading && reports.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-900 dark:text-gray-100" />
              </div>
            ) : (
              <div className="space-y-4">
                {reports.length === 0 && !loading && !error ? (
                  <p className="text-center text-gray-600 dark:text-gray-300 py-4">No reports generated yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100 dark:bg-gray-700">
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Report Name</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Date Range</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Orders</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Revenue</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Generated</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                            {report.report_name}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            <div className="text-sm">
                              {formatDate(report.start_date)} - {formatDate(report.end_date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                              {report.total_orders.toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-green-600 dark:text-green-400">
                            KSh {report.total_revenue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(report.generated_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadPDF(report.id, report.report_name)}
                                disabled={loading}
                                title="Download PDF"
                                className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:border-blue-700"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEmailModal({
                                  show: true,
                                  reportId: report.id,
                                  reportName: report.report_name
                                })}
                                disabled={loading}
                                title="Send via Email"
                                className="hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/30 dark:hover:border-green-700"
                              >
                                <Mail className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadChart(report.id, 'revenue', report.report_name)}
                                disabled={loading}
                                title="Download Revenue Chart"
                                className="hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/30 dark:hover:border-purple-700"
                              >
                                <BarChart3 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || loading}
                      className="bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600"
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                      disabled={currentPage === pagination.pages || loading}
                      className="bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {emailModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Mail className="w-5 h-5 mr-2" />
                Send Report via Email
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Send "{emailModal.reportName}" to an email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <Label htmlFor="recipientEmail" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Recipient Email *
                  </Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={emailForm.recipientEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, recipientEmail: e.target.value })}
                    placeholder="recipient@company.com"
                    className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senderEmail" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Sender Email (Optional)
                  </Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={emailForm.senderEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, senderEmail: e.target.value })}
                    placeholder="your-email@company.com"
                    className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Email
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEmailModal({ show: false, reportId: null, reportName: '' })}
                    disabled={loading}
                    className="bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const SystemReports: React.FC<SystemReportsProps> = ({ allOrders, getStatusColor }) => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                System Reports & Analytics
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Comprehensive business intelligence and reporting dashboard
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-300">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="analytics"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics Dashboard</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Report Management</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <ReportsAnalytics allOrders={allOrders} getStatusColor={getStatusColor} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemReports;
