import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Eye, 
  Check, 
  X, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Package,
  Calendar
} from 'lucide-react';

// Types
interface CustomImage {
  id: string;
  image_url: string;
  cloudinary_public_id: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  upload_date: string;
  approval_date?: string;
  approved_by?: string;
  rejection_reason?: string;
  order_item_id?: string;
  product_id?: string;
  order_info?: {
    order_number: string;
    customer_name: string;
    order_status: string;
  };
  order_item_info?: {
    quantity: number;
    unit_price: number;
  };
  product_info?: {
    name: string;
    description: string;
    price: number;
  };
}

interface GetCustomImagesResponse {
  custom_images: CustomImage[];
  total: number;
  pages: number;
  current_page: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

const AdminImage: React.FC = () => {
  const [images, setImages] = useState<CustomImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<CustomImage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const perPage = 12;

  // Fetch images from API
  const fetchImages = async (page = 1, status = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${import.meta.env.VITE_API_URL}/admin/custom-images?page=${page}&per_page=${perPage}`;
      if (status !== 'all') {
        url += `&status=${status}`;
      }

      const response = await axios.get<GetCustomImagesResponse>(url, {
        withCredentials: true
      });

      setImages(response.data.custom_images);
      setTotalPages(response.data.pages);
      setTotalImages(response.data.total);
      setCurrentPage(response.data.current_page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch images');
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for approval
  interface GetProductsResponse {
    products: Product[];
  }

  const fetchProducts = async () => {
    try {
      const response = await axios.get<GetProductsResponse>(`${import.meta.env.VITE_API_URL}/products`, {
        withCredentials: true
      });
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Handle image approval
  const handleApprove = async (imageId: string, productId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload: any = { action: 'approve' };
      if (productId) {
        payload.product_id = productId;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/custom-images/${imageId}/approve`,
        payload,
        { withCredentials: true }
      );

      setSuccess('Image approved successfully');
      setShowModal(false);
      setSelectedImage(null);
      setSelectedProductId('');
      fetchImages(currentPage, selectedStatus);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve image');
    } finally {
      setLoading(false);
    }
  };

  // Handle image rejection
  const handleReject = async (imageId: string, reason: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/custom-images/${imageId}/approve`,
        { 
          action: 'reject',
          rejection_reason: reason || 'No reason provided'
        },
        { withCredentials: true }
      );

      setSuccess('Image rejected successfully');
      setShowModal(false);
      setSelectedImage(null);
      setRejectionReason('');
      fetchImages(currentPage, selectedStatus);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject image');
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchImages(1, selectedStatus);
    fetchProducts();
  }, []);

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    fetchImages(1, status);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchImages(page, selectedStatus);
  };

  // Open modal for image actions
  const openModal = (image: CustomImage) => {
    setSelectedImage(image);
    setShowModal(true);
    setRejectionReason('');
    setSelectedProductId('');
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Images Management</h1>
        <p className="text-gray-600">Review and manage user-uploaded custom images</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Total: {totalImages} images
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {images.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-500">No custom images match the current filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Image */}
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.image_url}
                      alt="Custom upload"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(image.approval_status)}`}>
                        {getStatusIcon(image.approval_status)}
                        <span className="ml-1 capitalize">{image.approval_status}</span>
                      </span>
                    </div>

                    {/* Order Info */}
                    {image.order_info && (
                      <div className="mb-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {image.order_info.customer_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Order: {image.order_info.order_number}
                        </div>
                      </div>
                    )}

                    {/* Product Info */}
                    {image.product_info && (
                      <div className="mb-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Package className="w-3 h-3 mr-1" />
                          {image.product_info.name}
                        </div>
                      </div>
                    )}

                    {/* Upload Date */}
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(image.upload_date).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(image)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Review Custom Image</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              <div className="mb-6">
                <img
                  src={selectedImage.image_url}
                  alt="Custom upload"
                  className="w-full max-h-96 object-contain rounded-lg bg-gray-100"
                />
              </div>

              {/* Image Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Image Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Status: </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getStatusBadge(selectedImage.approval_status)}`}>
                        {getStatusIcon(selectedImage.approval_status)}
                        <span className="ml-1 capitalize">{selectedImage.approval_status}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Upload Date: </span>
                      {new Date(selectedImage.upload_date).toLocaleString()}
                    </div>
                    {selectedImage.approval_date && (
                      <div>
                        <span className="text-gray-500">Approval Date: </span>
                        {new Date(selectedImage.approval_date).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
                  {selectedImage.order_info ? (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Customer: </span>
                        {selectedImage.order_info.customer_name}
                      </div>
                      <div>
                        <span className="text-gray-500">Order: </span>
                        {selectedImage.order_info.order_number}
                      </div>
                      <div>
                        <span className="text-gray-500">Status: </span>
                        {selectedImage.order_info.order_status}
                      </div>
                      {selectedImage.order_item_info && (
                        <>
                          <div>
                            <span className="text-gray-500">Quantity: </span>
                            {selectedImage.order_item_info.quantity}
                          </div>
                          <div>
                            <span className="text-gray-500">Unit Price: </span>
                            ${selectedImage.order_item_info.unit_price}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No order information available</p>
                  )}
                </div>
              </div>

              {/* Actions for Pending Images */}
              {selectedImage.approval_status === 'pending' && (
                <div className="space-y-4">
                  {/* Product Selection for Approval */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to Product (Optional)
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a product...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rejection Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter reason for rejection..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedImage.id, selectedProductId || undefined)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedImage.id, rejectionReason)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection Reason Display */}
              {selectedImage.approval_status === 'rejected' && selectedImage.rejection_reason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-1">Rejection Reason:</h4>
                  <p className="text-red-700 text-sm">{selectedImage.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImage;