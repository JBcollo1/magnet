import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import {
  Edit,
  Save,
  Loader2,
  MapPin,
  DollarSign,
  Truck,
  Phone,
  Mail,
  User,
  Calendar,
  Clock,
  Check,
  X,
  Star
} from 'lucide-react';

// Interfaces
interface UserDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  dateJoined?: string;
  lastUpdated?: string;
}

interface PickupPoint {
  id: number;
  name: string;
  location_details: string;
  city?: string;
  phone_number?: string;
  cost: number;
  is_doorstep: boolean;
  delivery_method: string;
  contact_person?: string;
}

interface PickupPointsResponse {
  pickup_points: PickupPoint[];
  success?: boolean;
  message?: string;
}

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
}

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    dateJoined: "",
    lastUpdated: ""
  });
  const [availablePickupPoints, setAvailablePickupPoints] = useState<PickupPoint[]>([]);
  const [fetchingPickupPoints, setFetchingPickupPoints] = useState(false);
  const [pickupPointsError, setPickupPointsError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userDetails.city && userDetails.city.trim() !== '') {
      fetchPickupPoints(userDetails.city);
    } else {
      setAvailablePickupPoints([]);
      setPickupPointsError(null);
    }
  }, [userDetails.city]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get<UserDetails>(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        { withCredentials: true }
      );
      if (response.data) {
        setUserDetails(prev => ({
          ...prev,
          ...response.data,
          dateJoined: response.data.dateJoined ? new Date(response.data.dateJoined).toLocaleDateString() : 'N/A',
          lastUpdated: response.data.lastUpdated ? new Date(response.data.lastUpdated).toLocaleDateString() : 'N/A'
        }));
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile details from the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPickupPoints = async (city: string) => {
    setFetchingPickupPoints(true);
    setPickupPointsError(null);
    try {
      const response = await axios.get<PickupPointsResponse>(
        `${import.meta.env.VITE_API_URL}/pickup-points?city=${encodeURIComponent(city)}`,
        { withCredentials: true }
      );
      if (response.data && Array.isArray(response.data.pickup_points)) {
        if (response.data.pickup_points.length > 0) {
          setAvailablePickupPoints(response.data.pickup_points);
          setPickupPointsError(null);
        } else {
          setAvailablePickupPoints([]);
          setPickupPointsError(`No pickup points found for ${city}`);
        }
      } else {
        setAvailablePickupPoints([]);
        setPickupPointsError(`No pickup points available for ${city}`);
      }
    } catch (error) {
      console.error(`Failed to fetch pickup points for city ${city}:`, error);
      setAvailablePickupPoints([]);
      setPickupPointsError("Failed to load pickup points");
      toast({
        title: "Error",
        description: `Failed to load pickup points for ${city}`,
        variant: "destructive",
      });
    } finally {
      setFetchingPickupPoints(false);
    }
  };

  const handleSaveDetails = async () => {
    setLoading(true);
    try {
      const updatePayload = {
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone,
        address: userDetails.address,
        city: userDetails.city,
      };
      const response = await axios.put<ApiResponse<UserDetails>>(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        updatePayload,
        { withCredentials: true }
      );
      if (response.data) {
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        toast({
          title: "Details updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        throw new Error("Profile update failed on server.");
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Update failed",
        description: `Failed to update your profile: ${error instanceof Error ? error.message : "Network error"}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchUserProfile();
  };

  const handleSelectPickupPoint = (pointId: number) => {
    setSelectedPickupPoint(pointId);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal information and delivery preferences</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center animate-in slide-in-from-top-2 dark:bg-[#00C896]/10 dark:border-[#00C896]/30">
            <Check className="w-5 h-5 text-green-600 mr-3 dark:text-[#00C896]" />
            <span className="text-green-700 font-medium dark:text-[#00C896]">
              Profile updated successfully!
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl hover:shadow-2xl hover:border-green-300 transition-all duration-300 dark:bg-[#2D2D2D] dark:border-[#303030] dark:hover:border-[#00C896]/50">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg p-6 dark:from-[#00C896] dark:to-[#00BFA6]">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="flex items-center text-xl font-semibold mb-2">
                    <User className="w-6 h-6 mr-2" />
                    Personal Information
                  </h2>
                  <p className="text-green-100 dark:text-emerald-100">Your account details and contact information</p>
                </div>
                <div className="flex gap-2">
                  {isEditing && (
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 bg-red-100 border border-red-300 text-red-700 hover:bg-red-200 rounded-md transition-all duration-300 flex items-center text-sm dark:bg-red-500/20 dark:border-red-300/50 dark:text-white dark:hover:bg-red-500/30"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => (isEditing ? handleSaveDetails() : setIsEditing(true))}
                    disabled={loading}
                    className="px-3 py-2 bg-green-100 border border-green-300 text-green-700 hover:bg-green-200 backdrop-blur-sm rounded-md transition-all duration-300 flex items-center text-sm dark:bg-white/20 dark:border-white/30 dark:text-white dark:hover:bg-white/30"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : isEditing ? (
                      <Save className="w-4 h-4 mr-2" />
                    ) : (
                      <Edit className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center dark:text-gray-300">
                    <User className="w-4 h-4 mr-2 text-green-500 dark:text-[#00C896]" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userDetails.name}
                      onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 focus:border-green-500 text-gray-900 rounded-md transition-colors duration-300 dark:bg-[#1A1A1A] dark:border-[#303030] dark:focus:border-[#00C896] dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-300 rounded-md dark:bg-[#1A1A1A] dark:border-[#303030]">
                      <p className="font-medium text-gray-800 dark:text-white">{userDetails.name}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center dark:text-gray-300">
                    <Mail className="w-4 h-4 mr-2 text-green-500 dark:text-[#00C896]" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={userDetails.email}
                      onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 focus:border-green-500 text-gray-900 rounded-md transition-colors duration-300 dark:bg-[#1A1A1A] dark:border-[#303030] dark:focus:border-[#00C896] dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-300 rounded-md dark:bg-[#1A1A1A] dark:border-[#303030]">
                      <p className="font-medium text-gray-800 dark:text-white">{userDetails.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center dark:text-gray-300">
                  <Phone className="w-4 h-4 mr-2 text-green-500 dark:text-[#00C896]" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={userDetails.phone}
                    onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                    placeholder="+254 700 123 456"
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 focus:border-green-500 text-gray-900 rounded-md transition-colors duration-300 dark:bg-[#1A1A1A] dark:border-[#303030] dark:focus:border-[#00C896] dark:text-white"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-300 rounded-md dark:bg-[#1A1A1A] dark:border-[#303030]">
                    <p className="font-medium text-gray-800 dark:text-white">{userDetails.phone || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-[#303030]">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-green-500 dark:text-[#00C896]" />
                    Member Since
                  </label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md dark:bg-[#00C896]/10 dark:border-[#00C896]/30">
                    <p className="font-medium text-green-700 dark:text-[#00C896]">{userDetails.dateJoined}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center dark:text-gray-300">
                    <Clock className="w-4 h-4 mr-2 text-green-500 dark:text-[#00C896]" />
                    Last Updated
                  </label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md dark:bg-[#00C896]/10 dark:border-[#00C896]/30">
                    <p className="font-medium text-green-700 dark:text-[#00C896]">{userDetails.lastUpdated}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl hover:shadow-2xl hover:border-green-300 transition-all duration-300 dark:bg-[#2D2D2D] dark:border-[#303030] dark:hover:border-[#00C896]/50">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg p-6 dark:from-[#00C896] dark:to-[#00BFA6]">
              <h2 className="flex items-center text-xl font-semibold mb-2">
                <MapPin className="w-6 h-6 mr-2" />
                Delivery Address
              </h2>
              <p className="text-green-100 dark:text-emerald-100">Your default delivery address for orders</p>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-6">
              {/* Street Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Street Address
                </label>
                {isEditing ? (
                  <textarea
                    value={userDetails.address}
                    onChange={(e) => setUserDetails({ ...userDetails, address: e.target.value })}
                    rows={3}
                    placeholder="123 Main Street, Apartment 4B"
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 focus:border-green-500 text-gray-900 rounded-md transition-colors duration-300 resize-none dark:bg-[#1A1A1A] dark:border-[#303030] dark:focus:border-[#00C896] dark:text-white"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-300 rounded-md dark:bg-[#1A1A1A] dark:border-[#303030]">
                    <p className="font-medium text-gray-800 dark:text-white">{userDetails.address || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={userDetails.city}
                    onChange={(e) => setUserDetails({ ...userDetails, city: e.target.value })}
                    placeholder="Nairobi"
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 focus:border-green-500 text-gray-900 rounded-md transition-colors duration-300 dark:bg-[#1A1A1A] dark:border-[#303030] dark:focus:border-[#00C896] dark:text-white"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-300 rounded-md dark:bg-[#1A1A1A] dark:border-[#303030]">
                    <p className="font-medium text-gray-800 dark:text-white">{userDetails.city || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Pickup Points Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-[#303030]">
                <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4 dark:text-white">
                  <Truck className="w-5 h-5 mr-2 text-green-500 dark:text-[#00C896]" />
                  Available Pickup Points {userDetails.city && `in ${userDetails.city}`}
                </h3>

                {!userDetails.city ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Please set your city to view available pickup points.</p>
                  </div>
                ) : fetchingPickupPoints ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-3 text-green-500 dark:text-[#00C896]" />
                    <span className="text-gray-700 font-medium dark:text-gray-300">Loading pickup points...</span>
                  </div>
                ) : pickupPointsError ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">{pickupPointsError}</p>
                    <button
                      onClick={() => fetchPickupPoints(userDetails.city)}
                      className="px-3 py-2 bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 rounded-md transition-all duration-300 flex items-center text-sm dark:bg-white/20 dark:border-white/30 dark:text-white dark:hover:bg-white/30"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availablePickupPoints.length > 0 ? (
                      availablePickupPoints.map((point) => (
                        <div
                          key={point.id}
                          className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-lg ${
                            selectedPickupPoint === point.id
                              ? 'border-green-500 bg-green-50/50 shadow-md dark:border-[#00C896] dark:bg-[#00C896]/10'
                              : 'border-gray-200 hover:border-green-300 dark:border-[#303030] dark:hover:border-[#00C896]/50'
                          }`}
                          onClick={() => handleSelectPickupPoint(point.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">{point.name}</h4>
                                {selectedPickupPoint === point.id && (
                                  <div className="ml-2 flex items-center">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-xs text-green-600 font-medium ml-1 dark:text-[#00C896]">Selected</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-3 dark:text-gray-300">{point.location_details}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center text-green-600 dark:text-[#00C896]">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  <span className="font-semibold">KES {point.cost.toFixed(2)}</span>
                                </div>
                              </div>
                              <div className="flex items-center text-gray-500 text-xs mt-2 dark:text-gray-400">
                                <Truck className="w-3 h-3 mr-1" />
                                <span>{point.delivery_method}</span>
                                {point.is_doorstep && (
                                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-medium dark:bg-[#00C896]/20 dark:text-[#00C896]">
                                    Doorstep
                                  </span>
                                )}
                              </div>
                            </div>
                            {(point.phone_number || point.contact_person) && (
                              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-[#303030]">
                                {point.contact_person && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">Contact:</span> {point.contact_person}
                                  </p>
                                )}
                                {point.phone_number && (
                                  <p className="text-xs text-gray-500 flex items-center mt-1 dark:text-gray-400">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {point.phone_number}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No pickup points available for {userDetails.city}.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;