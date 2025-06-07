import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  Users,
  Package,
  FileText,
  Download,
  Mail,
  Calendar,
  BarChart3,
  PieChart,
  Plus,
  Eye,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Report API Integration
const reportAPI = {
  generateReport: async (reportData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/reports`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          report_name: reportData.reportName,
          start_date: reportData.startDate,
          end_date: reportData.endDate
        })
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        message: data.message || (response.ok ? 'Report generated successfully' : 'Failed to generate report')
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        error: error.message
      };
    }
  },

  getAllReports: async (page = 1, perPage = 10) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/reports?page=${page}&per_page=${perPage}`,
        { credentials: 'include' }
      );

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        reports: response.ok ? data.reports : [],
        pagination: response.ok ? {
          total: data.total,
          pages: data.pages,
          currentPage: data.current_page
        } : null
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        reports: [],
        error: error.message
      };
    }
  },

  downloadReportPDF: async (reportId, reportName = 'report') => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/download`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportName}_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Report downloaded successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  sendReportEmail: async (reportId, emailData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/email`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipient_email: emailData.recipientEmail,
            sender_email: emailData.senderEmail
          })
        }
      );

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        message: data.message || (response.ok ? 'Email sent successfully' : 'Failed to send email')
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        error: error.message
      };
    }
  },

  downloadChart: async (reportId, chartType, reportName = 'chart') => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/charts/${chartType}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error(`Failed to download ${chartType} chart`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartType}_chart_${reportName}_${reportId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: `${chartType} chart downloaded successfully` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// Report Management Component
const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [emailModal, setEmailModal] = useState({ show: false, reportId: null, reportName: '' });

  // Form states
  const [reportForm, setReportForm] = useState({
    reportName: '',
    startDate: '',
    endDate: ''
  });
  const [emailForm, setEmailForm] = useState({
    recipientEmail: '',
    senderEmail: ''
  });

  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, [currentPage]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    const result = await reportAPI.getAllReports(currentPage, 10);

    if (result.success) {
      setReports(result.reports);
      setPagination(result.pagination);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!reportForm.reportName.trim()) {
      setError('Report name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // Format dates for API
    const formattedData = {
      reportName: reportForm.reportName,
      startDate: reportForm.startDate ? new Date(reportForm.startDate).toISOString() : null,
      endDate: reportForm.endDate ? new Date(reportForm.endDate).toISOString() : null
    };

    const result = await reportAPI.generateReport(formattedData);

    if (result.success) {
      setSuccess(result.message);
      setShowGenerateForm(false);
      loadReports();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleDownloadPDF = async (reportId, reportName) => {
    setLoading(true);
    const result = await reportAPI.downloadReportPDF(reportId, reportName);

    if (result.success) {
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleDownloadChart = async (reportId, chartType, reportName) => {
    setLoading(true);
    const result = await reportAPI.downloadChart(reportId, chartType, reportName);

    if (result.success) {
      setSuccess(result.message);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.recipientEmail.trim()) {
      setError('Recipient email is required');
      return;
    }

    setLoading(true);
    setError('');
    const result = await reportAPI.sendReportEmail(emailModal.reportId, emailForm);

    if (result.success) {
      setSuccess(`Report sent successfully to ${emailForm.recipientEmail}`);
      setEmailModal({ show: false, reportId: null, reportName: '' });
      setEmailForm({ recipientEmail: '', senderEmail: '' });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Generate Report Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Generate New Report
              </CardTitle>
              <CardDescription>Create comprehensive sales and analytics reports</CardDescription>
            </div>
            <Button
              onClick={() => setShowGenerateForm(!showGenerateForm)}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </CardHeader>

        {showGenerateForm && (
          <CardContent>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reportName">Report Name *</Label>
                  <Input
                    id="reportName"
                    value={reportForm.reportName}
                    onChange={(e) => setReportForm({...reportForm, reportName: e.target.value})}
                    placeholder="e.g., Monthly Sales Report"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={reportForm.startDate}
                    onChange={(e) => setReportForm({...reportForm, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm({...reportForm, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Generate Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenerateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>View and manage all generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && reports.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.report_name}</TableCell>
                      <TableCell>
                        {formatDate(report.start_date)} - {formatDate(report.end_date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.total_orders}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        KSh {parseFloat(report.total_revenue).toLocaleString()}
                      </TableCell>
                      <TableCell>{formatDate(report.generated_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPDF(report.id, report.report_name)}
                            disabled={loading}
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
                          >
                            <Mail className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadChart(report.id, 'revenue', report.report_name)}
                            disabled={loading}
                          >
                            <BarChart3 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadChart(report.id, 'products', report.report_name)}
                            disabled={loading}
                          >
                            <PieChart className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-2 text-sm">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Modal */}
      {emailModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Send Report via Email</CardTitle>
              <CardDescription>Send "{emailModal.reportName}" to an email address</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={emailForm.recipientEmail}
                    onChange={(e) => setEmailForm({...emailForm, recipientEmail: e.target.value})}
                    placeholder="recipient@company.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senderEmail">Sender Email (Optional)</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={emailForm.senderEmail}
                    onChange={(e) => setEmailForm({...emailForm, senderEmail: e.target.value})}
                    placeholder="your-email@company.com"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Send Email
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEmailModal({ show: false, reportId: null, reportName: '' })}
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

// Enhanced Admin Dashboard Component
const AdminDashboard = ({ allUsers, allOrders, getStatusColor }) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">New order from Jane Smith - KSh 1,200</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Order ORD-003 shipped to Mike Johnson</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">New user registered: John Doe</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Orders Report
                </Button>
                <Button className="w-full" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Manage Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Users Tab */}
      <TabsContent value="users" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Management
            </CardTitle>
            <CardDescription>Manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.orders}</TableCell>
                    <TableCell>KSh {user.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Orders Tab */}
      <TabsContent value="orders" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Management
            </CardTitle>
            <CardDescription>View and manage all orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer || 'N/A'}</TableCell>
                    <TableCell>KSh {order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Reports Tab */}
      <TabsContent value="reports">
        <ReportManagement />
      </TabsContent>
    </Tabs>
  );
};

// Enhanced Admin Overview Cards Component
export const AdminOverviewCards = ({ allOrders, totalItemsInCart }) => {
  const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
  const completedOrders = allOrders.filter(order => order.status === 'delivered').length;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{allOrders.length}</div>
          <p className="text-xs text-muted-foreground">
            {completedOrders} completed, {pendingOrders} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            KSh {totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">From all completed orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{totalItemsInCart}</div>
          <p className="text-xs text-muted-foreground">Items in active carts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">12</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminDashboard;
