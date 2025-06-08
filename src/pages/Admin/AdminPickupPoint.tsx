import React, { useState } from 'react';
import {
  Loader2,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Phone,
  User,
  Building2
} from 'lucide-react';

interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  contactPerson: string;
  contactPhone: string;
}

interface AdminPickupPointProps {
  allPickupPoints: PickupPoint[];
  fetchAdminData: () => void;
}

const AdminPickupPoint: React.FC<AdminPickupPointProps> = ({ allPickupPoints, fetchAdminData }) => {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPickupPoint, setCurrentPickupPoint] = useState<PickupPoint | null>(null);
  const [formState, setFormState] = useState<Omit<PickupPoint, 'id'>>({
    name: '',
    address: '',
    city: '',
    contactPerson: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCreateClick = () => {
    setCurrentPickupPoint(null);
    setFormState({ name: '', address: '', city: '', contactPerson: '', contactPhone: '' });
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (pickupPoint) => {
    setCurrentPickupPoint(pickupPoint);
    setFormState(pickupPoint);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (pickupPoint) => {
    setCurrentPickupPoint(pickupPoint);
    setIsDeleteDialogOpen(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      fetchAdminData();
      setIsFormDialogOpen(false);
    } catch (error) {
      console.error('Failed to save pickup point:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!currentPickupPoint) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      fetchAdminData();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete pickup point:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockPickupPoints = [
    {
      id: '1',
      name: 'Downtown Hub',
      address: '123 Main Street',
      city: 'Nairobi',
      contactPerson: 'John Doe',
      contactPhone: '+254 700 123456'
    },
    {
      id: '2',
      name: 'Westlands Mall',
      address: '456 Westlands Road',
      city: 'Nairobi',
      contactPerson: 'Jane Smith',
      contactPhone: '+254 700 789012'
    },
    {
      id: '3',
      name: 'Thika Station',
      address: '789 Thika Highway',
      city: 'Thika',
      contactPerson: 'Mike Johnson',
      contactPhone: '+254 700 345678'
    }
  ];

  const displayPoints = allPickupPoints.length > 0 ? allPickupPoints : mockPickupPoints;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Pickup Points Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your delivery locations with ease</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Locations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{displayPoints.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Active Cities</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{new Set(displayPoints.map(p => p.city)).size}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Quick Actions</p>
                <button
                  onClick={handleCreateClick}
                  className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </button>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-white/90 to-blue-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-sm border-b border-white/20 dark:border-gray-700 pb-6 px-6 pt-6">
            <div className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Pickup Locations
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Create, update, and manage your pickup locations for seamless order fulfillment.
                </p>
              </div>
              <button
                onClick={handleCreateClick}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Location
              </button>
            </div>
          </div>

          <div className="p-0">
            {loading && !isFormDialogOpen && !isDeleteDialogOpen ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                    <div className="w-12 h-12 border-4 border-blue-500 rounded-full animate-spin absolute top-0 left-0" style={{clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'}}></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Loading pickup points...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 border-b border-gray-200 dark:border-gray-700">
                        <th className="font-bold text-gray-900 dark:text-gray-100 py-4 px-6 text-left">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location Name
                          </div>
                        </th>
                        <th className="font-bold text-gray-900 dark:text-gray-100 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Address & City
                          </div>
                        </th>
                        <th className="font-bold text-gray-900 dark:text-gray-100 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contact Person
                          </div>
                        </th>
                        <th className="font-bold text-gray-900 dark:text-gray-100 py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone Number
                          </div>
                        </th>
                        <th className="font-bold text-gray-900 dark:text-gray-100 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayPoints.map((point, index) => (
                        <tr
                          key={point.id}
                          className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{point.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-300">ID: {point.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{point.address}</p>
                              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{point.city}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{point.contactPerson}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                              <span className="font-mono text-gray-700 dark:text-gray-100">{point.contactPhone}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditClick(point)}
                                className="bg-white/80 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-md group-hover:scale-105"
                              >
                                <Edit3 className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(point)}
                                className="bg-white/80 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-md group-hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isFormDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 backdrop-blur-lg border-0 shadow-2xl rounded-2xl max-w-2xl w-full p-6">
            <div className="pb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                {currentPickupPoint ? (
                  <>
                    <Edit3 className="h-6 w-6 text-blue-600" />
                    Edit Pickup Location
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-blue-600" />
                    Create New Pickup Location
                  </>
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                {currentPickupPoint ? 'Update the details for this pickup location.' : 'Add a new pickup location to expand your delivery network.'}
              </p>
            </div>

            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Name
                  </label>
                  <input
                    id="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Downtown Hub"
                    className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    City
                  </label>
                  <input
                    id="city"
                    value={formState.city}
                    onChange={handleChange}
                    placeholder="Nairobi"
                    className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Full Address
                </label>
                <input
                  id="address"
                  value={formState.address}
                  onChange={handleChange}
                  placeholder="123 Main Street, Building A"
                  className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="contactPerson" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Person
                  </label>
                  <input
                    id="contactPerson"
                    value={formState.contactPerson}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contactPhone" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <input
                    id="contactPhone"
                    value={formState.contactPhone}
                    onChange={handleChange}
                    placeholder="+254 700 123456"
                    className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() => setIsFormDialogOpen(false)}
                className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-xl px-6 py-3 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 backdrop-blur-lg border-0 shadow-2xl rounded-2xl max-w-md w-full p-6">
            <div className="pb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Trash2 className="h-6 w-6 text-red-600" />
                Confirm Deletion
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                Are you sure you want to delete the pickup point{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">"{currentPickupPoint?.name}"</span>?{' '}
                This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-xl px-6 py-3 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
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
