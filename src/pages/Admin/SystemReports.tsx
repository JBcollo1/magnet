// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming these are from your ui library
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
// import {
//   Users,
//   Package,
//   FileText,
//   Download,
//   Mail,
//   Calendar,
//   BarChart3,
//   PieChart,
//   Plus,
//   Eye,
//   Send,
//   Loader2,
//   AlertCircle,
//   CheckCircle
// } from 'lucide-react';

// // --- Interface Definitions ---
// interface Order {
//   id: string;
//   date: string;
//   items: string;
//   total: number;
//   status: string;
//   paymentMethod: string;
//   customer?: string;
// }

// // Interface for a single report object received from the backend
// interface Report {
//   id: string;
//   report_name: string;
//   start_date: string | null;
//   end_date: string | null;
//   total_orders: number;
//   total_revenue: number;
//   generated_at: string;
//   // Add any other properties your backend report object might have
// }

// // Interface for pagination data
// interface Pagination {
//   total: number;
//   pages: number;
//   currentPage: number;
// }

// // Props for the main SystemReports component
// interface SystemReportsProps {
//   allOrders: Order[];
//   getStatusColor: (status: string) => string;
//   // If you want to include allUsers here for overall dashboard, add:
//   // allUsers: { id: string; name: string; email: string; orders: number; totalSpent: number; }[];
// }

// // --- Report API Integration ---
// const reportAPI = {
//   generateReport: async (reportData: { reportName: string; startDate: string | null; endDate: string | null }): Promise<{ success: boolean; data?: any; message: string; error?: string }> => {
//     try {
//       const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/reports`,
//         {
//           report_name: reportData.reportName,
//           start_date: reportData.startDate,
//           end_date: reportData.endDate
//         },
//         { withCredentials: true }
//       );

//       return {
//         success: response.status === 200 || response.status === 201,
//         data: response.data,
//         message: (response.data as { message?: string }).message || 'Report generated successfully'
//       };
//     } catch (error: any) {
//       console.error('Error generating report:', error);
//       return {
//         success: false,
//         message: error.response?.data?.message || 'Failed to generate report',
//         error: error.message
//       };
//     }
//   },

//   getAllReports: async (page: number = 1, perPage: number = 10): Promise<{ success: boolean; reports: Report[]; pagination: Pagination | null; message: string; error?: string }> => {
//     try {
//       interface GetAllReportsResponse {
//         reports: Report[];
//         pagination?: {
//           total: number;
//           pages: number;
//           current_page: number;
//         };
//         message?: string;
//       }
      
//       const response = await axios.get<GetAllReportsResponse>(`${import.meta.env.VITE_API_URL}/admin/reports?page=${page}&per_page=${perPage}`,
//         { withCredentials: true }
//       );
      
//       return {
//         success: response.status === 200,
//         reports: response.data.reports || [],
//         pagination: response.data.pagination ? {
//           total: response.data.pagination.total,
//           pages: response.data.pagination.pages,
//           currentPage: response.data.pagination.current_page
//         } : null,
//         message: response.data.message || 'Reports fetched successfully'
//       };
//     } catch (error: any) {
//       console.error('Error fetching reports:', error);
//       return {
//         success: false,
//         message: error.response?.data?.message || 'Network error occurred while fetching reports',
//         reports: [],
//         pagination: null,
//         error: error.message
//       };
//     }
//   },

//   downloadReportPDF: async (reportId: string, reportName: string = 'report'): Promise<{ success: boolean; message: string }> => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/download`,
//         {
//           withCredentials: true,
//           responseType: 'blob' // Important for downloading files
//         }
//       );

//       if (response.status !== 200) {
//         throw new Error('Failed to download report');
//       }

//       const blob = new Blob([response.data as BlobPart], { type: response.headers['content-type'] });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `${reportName}_${reportId}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);

//       return { success: true, message: 'Report downloaded successfully' };
//     } catch (error: any) {
//       console.error('Error downloading report:', error);
//       return { success: false, message: error.response?.data?.message || error.message || 'Failed to download report' };
//     }
//   },

//   sendReportEmail: async (reportId: string, emailData: { recipientEmail: string; senderEmail?: string }): Promise<{ success: boolean; data?: any; message: string; error?: string }> => {
//     try {
//       const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/email`,
//         {
//           recipient_email: emailData.recipientEmail,
//           sender_email: emailData.senderEmail
//         },
//         { withCredentials: true }
//       );

//       return {
//         success: response.status === 200,
//         data: response.data,
//         message: (response.data as { message?: string }).message || 'Email sent successfully'
//       };
//     } catch (error: any) {
//       console.error('Error sending email:', error);
//       return {
//         success: false,
//         message: error.response?.data?.message || 'Failed to send email',
//         error: error.message
//       };
//     }
//   },

//   downloadChart: async (reportId: string, chartType: 'revenue' | 'products', reportName: string = 'chart'): Promise<{ success: boolean; message: string }> => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/charts/${chartType}`,
//         {
//           withCredentials: true,
//           responseType: 'blob' // Important for downloading files
//         }
//       );

//       if (response.status !== 200) {
//         throw new Error(`Failed to download ${chartType} chart`);
//       }

//       const blob = new Blob([response.data as BlobPart], { type: response.headers['content-type'] });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `${chartType}_chart_${reportName}_${reportId}.png`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);

//       return { success: true, message: `${chartType} chart downloaded successfully` };
//     } catch (error: any) {
//       console.error('Error downloading chart:', error);
//       return { success: false, message: error.response?.data?.message || error.message || `Failed to download ${chartType} chart` };
//     }
//   }
// };

// // --- Report Management Component (uncommented and typed) ---
// const ReportManagement: React.FC = () => {
//   const [reports, setReports] = useState<Report[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pagination, setPagination] = useState<Pagination | null>(null);
//   const [showGenerateForm, setShowGenerateForm] = useState(false);
//   const [emailModal, setEmailModal] = useState<{ show: boolean; reportId: string | null; reportName: string }>({ show: false, reportId: null, reportName: '' });

//   // Form states
//   const [reportForm, setReportForm] = useState({
//     reportName: '',
//     startDate: '',
//     endDate: ''
//   });
//   const [emailForm, setEmailForm] = useState({
//     recipientEmail: '',
//     senderEmail: ''
//   });

//   // Load reports on component mount and page change
//   useEffect(() => {
//     loadReports();
//   }, [currentPage]);

//   const loadReports = async () => {
//     setLoading(true);
//     setError('');
//     setSuccess(''); // Clear success message on reload
//     const result = await reportAPI.getAllReports(currentPage, 10);

//     if (result.success) {
//       setReports(result.reports);
//       setPagination(result.pagination);
//     } else {
//       setError(result.message);
//     }
//     setLoading(false);
//   };

//   const handleGenerateReport = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!reportForm.reportName.trim()) {
//       setError('Report name is required');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     const formattedData = {
//       reportName: reportForm.reportName,
//       startDate: reportForm.startDate ? new Date(reportForm.startDate).toISOString() : null,
//       endDate: reportForm.endDate ? new Date(reportForm.endDate).toISOString() : null
//     };

//     const result = await reportAPI.generateReport(formattedData);

//     if (result.success) {
//       setSuccess(result.message);
//       setShowGenerateForm(false);
//       setReportForm({ reportName: '', startDate: '', endDate: '' }); // Clear form
//       loadReports(); // Reload reports after generation
//     } else {
//       setError(result.message);
//     }
//     setLoading(false);
//   };

//   const handleDownloadPDF = async (reportId: string, reportName: string) => {
//     setLoading(true);
//     setError('');
//     setSuccess('');
//     const result = await reportAPI.downloadReportPDF(reportId, reportName);

//     if (result.success) {
//       setSuccess(result.message);
//     } else {
//       setError(result.message);
//     }
//     setLoading(false);
//   };

//   const handleDownloadChart = async (reportId: string, chartType: 'revenue' | 'products', reportName: string) => {
//     setLoading(true);
//     setError('');
//     setSuccess('');
//     const result = await reportAPI.downloadChart(reportId, chartType, reportName);

//     if (result.success) {
//       setSuccess(result.message);
//     } else {
//       setError(result.message);
//     }
//     setLoading(false);
//   };

//   const handleSendEmail = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!emailForm.recipientEmail.trim()) {
//       setError('Recipient email is required');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');
//     const result = await reportAPI.sendReportEmail(emailModal.reportId!, emailForm); // `!` because we know it's not null here

//     if (result.success) {
//       setSuccess(`Report sent successfully to ${emailForm.recipientEmail}`);
//       setEmailModal({ show: false, reportId: null, reportName: '' });
//       setEmailForm({ recipientEmail: '', senderEmail: '' });
//     } else {
//       setError(result.message);
//     }
//     setLoading(false);
//   };

//   const formatDate = (dateString: string | null) => {
//     if (!dateString) return 'N/A';
//     // Ensure dateString is parsed correctly if it's an ISO string
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) { // Check for invalid date
//       return dateString; // Return original if invalid
//     }
//     return date.toLocaleDateString();
//   };

//   return (
//     <div className="space-y-6">
//       {/* Alerts */}
//       {error && (
//         <Alert className="border-red-200 bg-red-50">
//           <AlertCircle className="h-4 w-4 text-red-600" />
//           <AlertDescription className="text-red-800">{error}</AlertDescription>
//         </Alert>
//       )}

//       {success && (
//         <Alert className="border-green-200 bg-green-50">
//           <CheckCircle className="h-4 w-4 text-green-600" />
//           <AlertDescription className="text-green-800">{success}</AlertDescription>
//         </Alert>
//       )}

//       {/* Generate Report Section */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="flex items-center">
//                 <FileText className="w-5 h-5 mr-2" />
//                 Generate New Report
//               </CardTitle>
//               <CardDescription>Create comprehensive sales and analytics reports</CardDescription>
//             </div>
//             <Button
//               onClick={() => setShowGenerateForm(!showGenerateForm)}
//               className="flex items-center"
//               disabled={loading}
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               New Report
//             </Button>
//           </div>
//         </CardHeader>

//         {showGenerateForm && (
//           <CardContent>
//             <form onSubmit={handleGenerateReport} className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label htmlFor="reportName">Report Name *</Label>
//                   <Input
//                     id="reportName"
//                     value={reportForm.reportName}
//                     onChange={(e) => setReportForm({ ...reportForm, reportName: e.target.value })}
//                     placeholder="e.g., Monthly Sales Report"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="startDate">Start Date</Label>
//                   <Input
//                     id="startDate"
//                     type="date"
//                     value={reportForm.startDate}
//                     onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="endDate">End Date</Label>
//                   <Input
//                     id="endDate"
//                     type="date"
//                     value={reportForm.endDate}
//                     onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
//                   />
//                 </div>
//               </div>
//               <div className="flex space-x-2">
//                 <Button type="submit" disabled={loading}>
//                   {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
//                   Generate Report
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setShowGenerateForm(false)}
//                   disabled={loading}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         )}
//       </Card>

//       {/* Reports Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Generated Reports</CardTitle>
//           <CardDescription>View and manage all generated reports</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {loading && reports.length === 0 ? (
//             <div className="flex justify-center py-8">
//               <Loader2 className="w-6 h-6 animate-spin" />
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {reports.length === 0 && !loading && !error ? (
//                 <p className="text-center text-muted-foreground py-4">No reports generated yet.</p>
//               ) : (
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Report Name</TableHead>
//                       <TableHead>Date Range</TableHead>
//                       <TableHead>Orders</TableHead>
//                       <TableHead>Revenue</TableHead>
//                       <TableHead>Generated</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {reports.map((report) => (
//                       <TableRow key={report.id}>
//                         <TableCell className="font-medium">{report.report_name}</TableCell>
//                         <TableCell>
//                           {formatDate(report.start_date)} - {formatDate(report.end_date)}
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant="outline">{report.total_orders}</Badge>
//                         </TableCell>
//                         <TableCell className="font-medium text-green-600">
//                           KSh {parseFloat(report.total_revenue.toString()).toLocaleString()}
//                         </TableCell>
//                         <TableCell>{formatDate(report.generated_at)}</TableCell>
//                         <TableCell>
//                           <div className="flex space-x-1">
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleDownloadPDF(report.id, report.report_name)}
//                               disabled={loading}
//                               title="Download PDF"
//                             >
//                               <Download className="w-3 h-3" />
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => setEmailModal({
//                                 show: true,
//                                 reportId: report.id,
//                                 reportName: report.report_name
//                               })}
//                               disabled={loading}
//                               title="Send via Email"
//                             >
//                               <Mail className="w-3 h-3" />
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleDownloadChart(report.id, 'revenue', report.report_name)}
//                               disabled={loading}
//                               title="Download Revenue Chart (PNG)"
//                             >
//                               <BarChart3 className="w-3 h-3" />
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleDownloadChart(report.id, 'products', report.report_name)}
//                               disabled={loading}
//                               title="Download Product Chart (PNG)"
//                             >
//                               <PieChart className="w-3 h-3" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               )}

//               {/* Pagination */}
//               {pagination && pagination.pages > 1 && (
//                 <div className="flex justify-center space-x-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                     disabled={currentPage === 1 || loading}
//                   >
//                     Previous
//                   </Button>
//                   <span className="px-3 py-2 text-sm">
//                     Page {currentPage} of {pagination.pages}
//                   </span>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
//                     disabled={currentPage === pagination.pages || loading}
//                   >
//                     Next
//                   </Button>
//                 </div>
//               )}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Email Modal */}
//       {emailModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <Card className="w-full max-w-md mx-4">
//             <CardHeader>
//               <CardTitle>Send Report via Email</CardTitle>
//               <CardDescription>Send "{emailModal.reportName}" to an email address</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSendEmail} className="space-y-4">
//                 <div>
//                   <Label htmlFor="recipientEmail">Recipient Email *</Label>
//                   <Input
//                     id="recipientEmail"
//                     type="email"
//                     value={emailForm.recipientEmail}
//                     onChange={(e) => setEmailForm({ ...emailForm, recipientEmail: e.target.value })}
//                     placeholder="recipient@company.com"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="senderEmail">Sender Email (Optional)</Label>
//                   <Input
//                     id="senderEmail"
//                     type="email"
//                     value={emailForm.senderEmail}
//                     onChange={(e) => setEmailForm({ ...emailForm, senderEmail: e.target.value })}
//                     placeholder="your-email@company.com"
//                   />
//                 </div>
//                 <div className="flex space-x-2">
//                   <Button type="submit" disabled={loading}>
//                     {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
//                     Send Email
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setEmailModal({ show: false, reportId: null, reportName: '' })}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// };

// // --- Main SystemReports Component ---
// const SystemReports: React.FC<SystemReportsProps> = ({ allOrders, getStatusColor }) => {
//   // You can still keep the "Order Status Overview" or integrate it into the ReportManagement as a sub-section
//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Order Status Overview</CardTitle>
//           <CardDescription>Current status of all orders</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid md:grid-cols-4 gap-4">
//             {['delivered', 'shipped', 'processing', 'pending'].map((status) => {
//               const count = allOrders.filter(order => order.status.toLowerCase() === status).length;
//               return (
//                 <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
//                   <div className="text-2xl font-bold">{count}</div>
//                   <div className="text-sm text-gray-600 capitalize">{status}</div>
//                 </div>
//               );
//             })}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Integrate the comprehensive ReportManagement component here */}
//       <ReportManagement />
//     </div>
//   );
// };

// export default SystemReports;
import React, { useState } from 'react';
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
interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: string;
  paymentMethod: string;
  customer: string;
}

// Define the SystemReportsProps interface
interface SystemReportsProps {
  allOrders: Order[];
  getStatusColor: (status: string) => string;
}

// Mock data for demonstration
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
  <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className={`absolute inset-0 bg-gradient-to-r from-${color}-500/5 to-${color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {change}% from last month
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
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
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
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
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Revenue & Orders Trend
            </CardTitle>
            <CardDescription>Monthly performance overview</CardDescription>
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
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2" />
              Product Performance
            </CardTitle>
            <CardDescription>Sales distribution by product</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Order Status Distribution
          </CardTitle>
          <CardDescription>Real-time order processing insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { status: 'Delivered', count: 450, percentage: 65 },
                { status: 'Shipped', count: 120, percentage: 17 },
                { status: 'Processing', count: 85, percentage: 12 },
                { status: 'Pending', count: 40, percentage: 6 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              {[
                { status: 'delivered', count: 450, percentage: 65, color: 'green' },
                { status: 'shipped', count: 120, percentage: 17, color: 'blue' },
                { status: 'processing', count: 85, percentage: 12, color: 'yellow' },
                { status: 'pending', count: 40, percentage: 6, color: 'gray' },
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} getStatusColor={getStatusColor} />
                    <span className="font-medium text-gray-900">{item.count} orders</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{item.percentage}%</div>
                    <div className={`w-16 h-2 bg-${item.color}-200 rounded-full overflow-hidden`}>
                      <div
                        className={`h-full bg-${item.color}-500 transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Recent Orders
              </CardTitle>
              <CardDescription>Latest order activities and transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{order.items}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      KSh {order.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} getStatusColor={getStatusColor} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
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
  const [reports, setReports] = useState([
    {
      id: '1',
      report_name: 'Q4 Sales Report',
      start_date: '2024-10-01',
      end_date: '2024-12-31',
      total_orders: 1245,
      total_revenue: 328000,
      generated_at: '2024-12-15'
    },
    {
      id: '2',
      report_name: 'Monthly Performance',
      start_date: '2024-11-01',
      end_date: '2024-11-30',
      total_orders: 456,
      total_revenue: 128000,
      generated_at: '2024-12-01'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [emailModal, setEmailModal] = useState({ show: false, reportId: null, reportName: '' });

  const [reportForm, setReportForm] = useState({
    reportName: '',
    startDate: '',
    endDate: ''
  });

  const [emailForm, setEmailForm] = useState({
    recipientEmail: '',
    senderEmail: ''
  });

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!reportForm.reportName.trim()) {
      setError('Report name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      const newReport = {
        id: (reports.length + 1).toString(),
        report_name: reportForm.reportName,
        start_date: reportForm.startDate || null,
        end_date: reportForm.endDate || null,
        total_orders: Math.floor(Math.random() * 1000) + 100,
        total_revenue: Math.floor(Math.random() * 100000) + 50000,
        generated_at: new Date().toISOString().split('T')[0]
      };

      setReports([newReport, ...reports]);
      setSuccess('Report generated successfully!');
      setShowGenerateForm(false);
      setReportForm({ reportName: '', startDate: '', endDate: '' });
      setLoading(false);
    }, 2000);
  };

  const handleDownloadPDF = (reportId, reportName) => {
    setSuccess(`Downloading ${reportName}...`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(`Report sent successfully to ${emailForm.recipientEmail}`);
      setEmailModal({ show: false, reportId: null, reportName: '' });
      setEmailForm({ recipientEmail: '', senderEmail: '' });
      setLoading(false);
    }, 1500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
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

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-xl">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Generate New Report
              </CardTitle>
              <CardDescription className="text-base">
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
          <CardContent className="bg-gray-50 border-t">
            <form onSubmit={handleGenerateReport} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="reportName" className="text-sm font-semibold text-gray-700">
                    Report Name *
                  </Label>
                  <Input
                    id="reportName"
                    value={reportForm.reportName}
                    onChange={(e) => setReportForm({ ...reportForm, reportName: e.target.value })}
                    placeholder="e.g., Monthly Sales Report"
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={reportForm.startDate}
                    onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
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
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Generated Reports</CardTitle>
          <CardDescription className="text-base">
            View, download, and manage all generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Report Name</TableHead>
                  <TableHead className="font-semibold">Date Range</TableHead>
                  <TableHead className="font-semibold">Orders</TableHead>
                  <TableHead className="font-semibold">Revenue</TableHead>
                  <TableHead className="font-semibold">Generated</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">
                      {report.report_name}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(report.start_date)} - {formatDate(report.end_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {report.total_orders.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      KSh {report.total_revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
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
                          className="hover:bg-blue-50 hover:border-blue-300"
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
                          className="hover:bg-green-50 hover:border-green-300"
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(report.id, `${report.report_name}_revenue_chart`)}
                          disabled={loading}
                          title="Download Revenue Chart"
                          className="hover:bg-purple-50 hover:border-purple-300"
                        >
                          <BarChart3 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {emailModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Send Report via Email
              </CardTitle>
              <CardDescription>
                Send "{emailModal.reportName}" to an email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <Label htmlFor="recipientEmail" className="text-sm font-semibold text-gray-700">
                    Recipient Email *
                  </Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={emailForm.recipientEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, recipientEmail: e.target.value })}
                    placeholder="recipient@company.com"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senderEmail" className="text-sm font-semibold text-gray-700">
                    Sender Email (Optional)
                  </Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={emailForm.senderEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, senderEmail: e.target.value })}
                    placeholder="your-email@company.com"
                    className="mt-1"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                System Reports & Analytics
              </h1>
              <p className="text-lg text-gray-600">
                Comprehensive business intelligence and reporting dashboard
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2 bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="analytics"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics Dashboard</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
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
