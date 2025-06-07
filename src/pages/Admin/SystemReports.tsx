import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming these are from your ui library
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

// --- Interface Definitions ---
interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: string;
  paymentMethod: string;
  customer?: string;
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
  // Add any other properties your backend report object might have
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
  // If you want to include allUsers here for overall dashboard, add:
  // allUsers: { id: string; name: string; email: string; orders: number; totalSpent: number; }[];
}

// --- Report API Integration ---
const reportAPI = {
  generateReport: async (reportData: { reportName: string; startDate: string | null; endDate: string | null }): Promise<{ success: boolean; data?: any; message: string; error?: string }> => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/reports`,
        {
          report_name: reportData.reportName,
          start_date: reportData.startDate,
          end_date: reportData.endDate
        },
        { withCredentials: true }
      );

      return {
        success: response.status === 200 || response.status === 201,
        data: response.data,
        message: (response.data as { message?: string }).message || 'Report generated successfully'
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

  getAllReports: async (page: number = 1, perPage: number = 10): Promise<{ success: boolean; reports: Report[]; pagination: Pagination | null; message: string; error?: string }> => {
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
      
      const response = await axios.get<GetAllReportsResponse>(`${import.meta.env.VITE_API_URL}/admin/reports?page=${page}&per_page=${perPage}`,
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

  downloadReportPDF: async (reportId: string, reportName: string = 'report'): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/download`,
        {
          withCredentials: true,
          responseType: 'blob' // Important for downloading files
        }
      );

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

  sendReportEmail: async (reportId: string, emailData: { recipientEmail: string; senderEmail?: string }): Promise<{ success: boolean; data?: any; message: string; error?: string }> => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/email`,
        {
          recipient_email: emailData.recipientEmail,
          sender_email: emailData.senderEmail
        },
        { withCredentials: true }
      );

      return {
        success: response.status === 200,
        data: response.data,
        message: (response.data as { message?: string }).message || 'Email sent successfully'
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

  downloadChart: async (reportId: string, chartType: 'revenue' | 'products', reportName: string = 'chart'): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/charts/${chartType}`,
        {
          withCredentials: true,
          responseType: 'blob' // Important for downloading files
        }
      );

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

// --- Report Management Component (uncommented and typed) ---
const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [emailModal, setEmailModal] = useState<{ show: boolean; reportId: string | null; reportName: string }>({ show: false, reportId: null, reportName: '' });

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

  // Load reports on component mount and page change
  useEffect(() => {
    loadReports();
  }, [currentPage]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    setSuccess(''); // Clear success message on reload
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
      setReportForm({ reportName: '', startDate: '', endDate: '' }); // Clear form
      loadReports(); // Reload reports after generation
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
    const result = await reportAPI.sendReportEmail(emailModal.reportId!, emailForm); // `!` because we know it's not null here

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
    // Ensure dateString is parsed correctly if it's an ISO string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Check for invalid date
      return dateString; // Return original if invalid
    }
    return date.toLocaleDateString();
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
              disabled={loading}
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
                    onChange={(e) => setReportForm({ ...reportForm, reportName: e.target.value })}
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
                    onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
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
                  disabled={loading}
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
              {reports.length === 0 && !loading && !error ? (
                <p className="text-center text-muted-foreground py-4">No reports generated yet.</p>
              ) : (
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
                          KSh {parseFloat(report.total_revenue.toString()).toLocaleString()}
                        </TableCell>
                        <TableCell>{formatDate(report.generated_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(report.id, report.report_name)}
                              disabled={loading}
                              title="Download PDF"
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
                            >
                              <Mail className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadChart(report.id, 'revenue', report.report_name)}
                              disabled={loading}
                              title="Download Revenue Chart (PNG)"
                            >
                              <BarChart3 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadChart(report.id, 'products', report.report_name)}
                              disabled={loading}
                              title="Download Product Chart (PNG)"
                            >
                              <PieChart className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

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
                    onChange={(e) => setEmailForm({ ...emailForm, recipientEmail: e.target.value })}
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
                    onChange={(e) => setEmailForm({ ...emailForm, senderEmail: e.target.value })}
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
                    disabled={loading}
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

// --- Main SystemReports Component ---
const SystemReports: React.FC<SystemReportsProps> = ({ allOrders, getStatusColor }) => {
  // You can still keep the "Order Status Overview" or integrate it into the ReportManagement as a sub-section
  return (
    <div className="space-y-6">
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

      {/* Integrate the comprehensive ReportManagement component here */}
      <ReportManagement />
    </div>
  );
};

export default SystemReports;