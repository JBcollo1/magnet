import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Phone,
  User,
  Building2,
  DollarSign,
  Truck,
  Home,
  X,
  Check
} from 'lucide-react';
import axios from 'axios'; // Make sure you have axios installed: npm install axios or yarn add axios

// Extend the interface to precisely match your backend PickupPoint model's as_dict() output
interface PickupPoint {
  id: string;
  name: string;
  location_details: string; // Maps to 'address' in your original frontend mock
  city: string;
  is_active: boolean; // From backend, might not be edited by admin in this UI
  created_at: string; // ISO format string from backend
  updated: string;   // ISO format string from backend
  cost: number;
  phone_number: string; // Maps to 'contactPhone' in your original frontend mock
  is_doorstep: boolean;
  delivery_method: string;
  contact_person: string | null; // Added based on your latest backend model, nullable
}

// Type for the form state, excluding 'id', and with 'contact_person' as string (as input will be string)
type FormPickupPoint = Omit<PickupPoint, 'id' | 'created_at' | 'updated' | 'is_active'>;

const AdminPickupPoint: React.FC = () => {
  const [allPickupPoints, setAllPickupPoints] = useState<PickupPoint[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPickupPoint, setCurrentPickupPoint] = useState<PickupPoint | null>(null);
  const [formState, setFormState] = useState<FormPickupPoint>({
    name: '',
    location_details: '',
    city: '',
    contact_person: '',
    phone_number: '',
    cost: 0,
    is_doorstep: false,
    delivery_method: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Base URL for your backend API
  // Ensure VITE_API_URL is set in your .env.development or .env file (e.g., VITE_API_URL=http://127.0.0.1:5000)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

  // Function to get the JWT token (adjust this based on your actual authentication flow)
  const getAuthToken = () => {
    // Example: Retrieve from localStorage. In a real app, you might use context, Redux, or a secure cookie.
    return localStorage.getItem('access_token');
  };

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for sending cookies/sessions if your backend requires them
    headers: {
      'Content-Type': 'application/json',
      // Dynamically add Authorization header. Axios interceptors are often better for this.
      // For simplicity here, we add it directly, but consider an interceptor for larger apps.
    },
  });

  // Add an interceptor to include the token in every request if it exists
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );


  // Function to fetch all pickup points for the admin
  const fetchAdminPickupPoints = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // Endpoint for admin to get all pickup points
      const response = await axiosInstance.get<{ pickup_points: PickupPoint[] }>('/admin/pickup-points');
      setAllPickupPoints(response.data.pickup_points);
    } catch (err: any) {
      console.error('Failed to fetch admin pickup points:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load pickup points. Please try again.');
      setAllPickupPoints([]); // Clear existing data on error
    } finally {
      setLoading(false);
    }
  }, [axiosInstance]); // Depend on axiosInstance if it could change (though usually it's static)

  // Fetch data on component mount
  useEffect(() => {
    fetchAdminPickupPoints();
  }, [fetchAdminPickupPoints]); // Re-run if fetchAdminPickupPoints changes (due to useCallback deps)

  // Helper function to show messages
  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(message);
      setError(null);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, 5000); // Messages disappear after 5 seconds
  };

  const handleCreateClick = () => {
    setCurrentPickupPoint(null);
    // Reset form state for new creation
    setFormState({
      name: '',
      location_details: '',
      city: '',
      contact_person: '',
      phone_number: '',
      cost: 0,
      is_doorstep: false,
      delivery_method: ''
    });
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (pickupPoint: PickupPoint) => {
    setCurrentPickupPoint(pickupPoint);
    // Populate form state with current pickup point's data
    setFormState({
      name: pickupPoint.name,
      location_details: pickupPoint.location_details,
      city: pickupPoint.city,
      contact_person: pickupPoint.contact_person || '', // Handle potential null/undefined
      phone_number: pickupPoint.phone_number || '', // Handle potential null/undefined
      cost: pickupPoint.cost,
      is_doorstep: pickupPoint.is_doorstep,
      delivery_method: pickupPoint.delivery_method
    });
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (pickupPoint: PickupPoint) => {
    setCurrentPickupPoint(pickupPoint);
    setIsDeleteDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setFormState(prevState => {
      if (type === 'checkbox') {
        return { ...prevState, [id]: (e.target as HTMLInputElement).checked };
      } else if (type === 'number') {
        return { ...prevState, [id]: parseFloat(value) || 0 }; // Ensure cost is a number
      } else {
        return { ...prevState, [id]: value };
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Prepare data to send to backend, mapping frontend to backend fields
    const payload = {
      name: formState.name,
      location_details: formState.location_details,
      city: formState.city,
      phone_number: formState.phone_number,
      contact_person: formState.contact_person, // This must be accepted by your backend now
      cost: formState.cost,
      is_doorstep: formState.is_doorstep,
      delivery_method: formState.delivery_method,
      // is_active is typically managed on the backend or set explicitly if editable
    };

    try {
      if (currentPickupPoint) {
        // Update existing pickup point (PUT request)
        await axiosInstance.put(`/pickup-points/${currentPickupPoint.id}`, payload);
        showMessage('Pickup point updated successfully!');
      } else {
        // Create new pickup point (POST request)
        await axiosInstance.post('/pickup-points', payload);
        showMessage('Pickup point created successfully!');
      }
      fetchAdminPickupPoints(); // Re-fetch data to update the list in the table
      setIsFormDialogOpen(false); // Close the form dialog
    } catch (err: any) {
      console.error('Failed to save pickup point:', err.response?.data || err.message);
      showMessage(err.response?.data?.message || 'Failed to save pickup point. Please try again.', true);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!currentPickupPoint) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Delete pickup point (DELETE request)
      await axiosInstance.delete(`/pickup-points/${currentPickupPoint.id}`);
      showMessage('Pickup point deleted successfully!');
      fetchAdminPickupPoints(); // Re-fetch data to update the list
      setIsDeleteDialogOpen(false); // Close the delete confirmation dialog
    } catch (err: any) {
      console.error('Failed to delete pickup point:', err.response?.data || err.message);
      showMessage(err.response?.data?.message || 'Failed to delete pickup point. Please try again.', true);
    } finally {
      setLoading(false);
    }
  };

  const totalCities = new Set(allPickupPoints.map(p => p.city)).size;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Pickup Points Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your delivery locations with ease
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
            <X className="h-4 w-4 fill-current" />
          </span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setSuccessMessage(null)}>
            <Check className="h-4 w-4 fill-current" />
          </span>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-900 dark:text-blue-300">Total Locations</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{allPickupPoints.length}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <MapPin className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-900 dark:text-green-300">Active Cities</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">{totalCities}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-900 dark:text-purple-300">Quick Actions</p>
              <button
                onClick={handleCreateClick}
                className="mt-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-lg px-2 py-1 text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Location
              </button>
            </div>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Plus className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-600 p-4">
          <div className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Pickup Locations
              </h2>
              <p className="text-muted-foreground text-xs">
                Create, update, and manage your pickup locations for seamless order fulfillment.
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-lg px-3 py-2 text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add New Location
            </button>
          </div>
        </div>

        <div className="p-0">
          {loading && !isFormDialogOpen && !isDeleteDialogOpen ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-muted-foreground text-xs font-medium">Fetching pickup points...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-150 dark:hover:from-gray-600 dark:hover:to-gray-550">
                      <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Location Name
                        </div>
                      </th>
                      <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Address & City
                        </div>
                      </th>
                      <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Contact Person
                        </div>
                      </th>
                      <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone Number
                        </div>
                      </th>
                      <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Cost (Ksh)
                        </div>
                      </th>
                      <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left">
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Delivery Method
                        </div>
                      </th>
                      <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-left">
                        <div className="flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          Doorstep
                        </div>
                      </th>
                      <th className="font-semibold text-gray-900 dark:text-gray-100 py-2 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPickupPoints.length === 0 && !loading ? (
                        <tr>
                            <td colSpan={8} className="text-center py-4 text-muted-foreground">
                                No pickup points available. Create one!
                            </td>
                        </tr>
                    ) : (
                        allPickupPoints.map((point, index) => (
                        <tr
                            key={point.id}
                            className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750/30'}`}
                        >
                            <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{point.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-300">ID: {point.id}</p>
                                </div>
                            </div>
                            </td>
                            <td className="py-2 px-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{point.location_details}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{point.city}</p>
                            </div>
                            </td>
                            <td className="py-2 px-3">
                            <div className="flex items-center gap-1">
                                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{point.contact_person || 'N/A'}</span>
                            </div>
                            </td>
                            <td className="py-2 px-3">
                            <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400 dark:text-gray-300" />
                                <span className="text-xs font-mono text-gray-700 dark:text-gray-100">{point.phone_number || 'N/A'}</span>
                            </div>
                            </td>
                            <td className="py-2 px-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Ksh {point.cost.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {point.delivery_method}
                            </td>
                            <td className="py-2 px-3 text-center">
                                {point.is_doorstep ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                            </td>
                            <td className="py-2 px-3">
                            <div className="flex justify-center gap-1">
                                <button
                                onClick={() => handleEditClick(point)}
                                className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                                title="Edit"
                                >
                                <Edit3 className="h-3 w-3" />
                                </button>
                                <button
                                onClick={() => handleDeleteClick(point)}
                                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                title="Delete"
                                >
                                <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                            </td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {isFormDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg max-w-md w-full p-4">
            <div className="pb-4 border-b dark:border-gray-600">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                {currentPickupPoint ? (
                  <>
                    <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Edit Pickup Location
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Create New Pickup Location
                  </>
                )}
              </h2>
              <p className="text-muted-foreground text-xs mt-1">
                {currentPickupPoint ? 'Update the details for this pickup location.' : 'Add a new pickup location to expand your delivery network.'}
              </p>
            </div>

            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location Name
                  </label>
                  <input
                    id="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Downtown Hub"
                    className="w-full h-8 rounded-lg border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30 text-xs px-2"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="city" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    City
                  </label>
                  <input
                    id="city"
                    value={formState.city}
                    onChange={handleChange}
                    placeholder="Nairobi"
                    className="w-full h-8 rounded-lg border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30 text-xs px-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="location_details" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Full Address / Location Details
                </label>
                <input
                  id="location_details"
                  value={formState.location_details}
                  onChange={handleChange}
                  placeholder="123 Main Street, Building A"
                  className="w-full h-8 rounded-lg border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30 text-xs px-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="contact_person" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Contact Person
                  </label>
                  <input
                    id="contact_person"
                    value={formState.contact_person || ''} // Ensure it's a string for input
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full h-8 rounded-lg border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30 text-xs px-2"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone_number" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </label>
                  <input
                    id="phone_number"
                    value={formState.phone_number || ''} // Ensure it's a string for input
                    onChange={handleChange}
                    placeholder="+254 700 123456"
                    className="w-full h-8 rounded-lg border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30 text-xs px-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="cost" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Cost (Ksh)
                  </label>
                  <input
                    id="cost"
                    type="number"
                    value={formState.cost}
                    onChange={handleChange}
                    placeholder="150.00"
                    step="0.01"
                    className="w-full h-8 rounded-lg border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30 text-xs px-2"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="delivery_method" className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Delivery Method
                  </label>
                  <select
                    id="delivery_method"
                    value={formState.delivery_method}
                    onChange={handleChange}
                    className="w-full h-8 rounded-lg border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30 text-xs px-2"
                  >
                    <option value="">Select Method</option>
                    <option value="Mtaani Agent">Mtaani Agent</option>
                    <option value="By Bus">By Bus</option>
                    <option value="Courier">Courier</option>
                    <option value="Doorstep">Doorstep</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_doorstep"
                  checked={formState.is_doorstep}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-600 dark:checked:border-blue-600"
                />
                <label htmlFor="is_doorstep" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Is Doorstep Delivery?
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-600">
              <button
                onClick={() => setIsFormDialogOpen(false)}
                className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg px-3 py-1 text-xs transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-lg px-3 py-1 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {currentPickupPoint ? 'Save Changes' : 'Create Location'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg max-w-sm w-full p-4">
            <div className="pb-4 border-b dark:border-gray-600">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                Confirm Deletion
              </h2>
              <p className="text-muted-foreground text-xs mt-1">
                Are you sure you want to delete the pickup point{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">"{currentPickupPoint?.name}"</span>?{' '}
                This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg px-3 py-1 text-xs transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 rounded-lg px-3 py-1 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete Location
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPickupPoint;