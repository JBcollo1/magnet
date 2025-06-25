import React, { useState, useEffect } from 'react';
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

// Mock interfaces for demo
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

// Mock data for demonstration
const mockUser: UserDetails = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+254700123456",
  address: "123 Moi Avenue, Westlands",
  city: "Nairobi",
  dateJoined: "01/15/2023",
  lastUpdated: "12/01/2024"
};

const mockPickupPoints: PickupPoint[] = [
  {
    id: 1,
    name: "Westlands Mall Collection Point",
    location_details: "Ground Floor, Next to Nakumatt Westlands",
    city: "Nairobi",
    phone_number: "+254712345678",
    cost: 150,
    is_doorstep: false,
    delivery_method: "Collection Point",
    contact_person: "Sarah Mwangi"
  },
  {
    id: 2,
    name: "CBD Express Hub",
    location_details: "Tom Mboya Street, Opposite I&M Bank",
    city: "Nairobi",
    phone_number: "+254722345678",
    cost: 200,
    is_doorstep: false,
    delivery_method: "Express Hub",
    contact_person: "David Kiprotich"
  },
  {
    id: 3,
    name: "Doorstep Delivery",
    location_details: "Direct delivery to your address",
    city: "Nairobi",
    cost: 350,
    is_doorstep: true,
    delivery_method: "Doorstep Delivery",
    contact_person: "Delivery Team"
  }
];

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<number | null>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>(mockUser);
  const [availablePickupPoints, setAvailablePickupPoints] = useState<PickupPoint[]>(mockPickupPoints);
  const [fetchingPickupPoints, setFetchingPickupPoints] = useState(false);

  const handleSaveDetails = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUserDetails(mockUser);
  };

  const handleSelectPickupPoint = (pointId: number) => {
    setSelectedPickupPoint(pointId);
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-400">Manage your personal information and delivery preferences</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-[#00C896]/10 border border-[#00C896]/30 rounded-lg flex items-center animate-in slide-in-from-top-2">
            <Check className="w-5 h-5 text-[#00C896] mr-3" />
            <span className="text-[#00C896] font-medium">
              Profile updated successfully!
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <div className="bg-[#2D2D2D] border border-[#303030] rounded-lg shadow-xl hover:shadow-2xl hover:border-[#00C896]/50 transition-all duration-300">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#00C896] to-[#00BFA6] text-white rounded-t-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="flex items-center text-xl font-semibold mb-2">
                    <User className="w-6 h-6 mr-2" />
                    Personal Information
                  </h2>
                  <p className="text-emerald-100">Your account details and contact information</p>
                </div>
                <div className="flex gap-2">
                  {isEditing && (
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 bg-red-500/20 border border-red-300/50 text-white hover:bg-red-500/30 rounded-md transition-all duration-300 flex items-center text-sm"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => isEditing ? handleSaveDetails() : setIsEditing(true)}
                    disabled={loading}
                    className="px-3 py-2 bg-white/20 border border-white/30 text-white hover:bg-white/30 backdrop-blur-sm rounded-md transition-all duration-300 flex items-center text-sm"
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
                  <label className="text-sm font-semibold text-gray-300 flex items-center">
                    <User className="w-4 h-4 mr-2 text-[#00C896]" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userDetails.name}
                      onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border-2 border-[#303030] focus:border-[#00C896] text-white rounded-md transition-colors duration-300"
                    />
                  ) : (
                    <div className="p-3 bg-[#1A1A1A] border border-[#303030] rounded-md">
                      <p className="font-medium text-white">{userDetails.name}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-[#00C896]" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={userDetails.email}
                      onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border-2 border-[#303030] focus:border-[#00C896] text-white rounded-md transition-colors duration-300"
                    />
                  ) : (
                    <div className="p-3 bg-[#1A1A1A] border border-[#303030] rounded-md">
                      <p className="font-medium text-white">{userDetails.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-[#00C896]" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={userDetails.phone}
                    onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                    placeholder="+254 700 123 456"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border-2 border-[#303030] focus:border-[#00C896] text-white rounded-md transition-colors duration-300"
                  />
                ) : (
                  <div className="p-3 bg-[#1A1A1A] border border-[#303030] rounded-md">
                    <p className="font-medium text-white">{userDetails.phone || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#303030]">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-[#00C896]" />
                    Member Since
                  </label>
                  <div className="p-3 bg-[#00C896]/10 border border-[#00C896]/30 rounded-md">
                    <p className="font-medium text-[#00C896]">{userDetails.dateJoined}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-[#00C896]" />
                    Last Updated
                  </label>
                  <div className="p-3 bg-[#00C896]/10 border border-[#00C896]/30 rounded-md">
                    <p className="font-medium text-[#00C896]">{userDetails.lastUpdated}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-[#2D2D2D] border border-[#303030] rounded-lg shadow-xl hover:shadow-2xl hover:border-[#00C896]/50 transition-all duration-300">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#00C896] to-[#00BFA6] text-white rounded-t-lg p-6">
              <h2 className="flex items-center text-xl font-semibold mb-2">
                <MapPin className="w-6 h-6 mr-2" />
                Delivery Address
              </h2>
              <p className="text-emerald-100">Your default delivery address for orders</p>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-6">
              {/* Street Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  Street Address
                </label>
                {isEditing ? (
                  <textarea
                    value={userDetails.address}
                    onChange={(e) => setUserDetails({ ...userDetails, address: e.target.value })}
                    rows={3}
                    placeholder="123 Main Street, Apartment 4B"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border-2 border-[#303030] focus:border-[#00C896] text-white rounded-md transition-colors duration-300 resize-none"
                  />
                ) : (
                  <div className="p-3 bg-[#1A1A1A] border border-[#303030] rounded-md">
                    <p className="font-medium text-white">{userDetails.address || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={userDetails.city}
                    onChange={(e) => setUserDetails({ ...userDetails, city: e.target.value })}
                    placeholder="Nairobi"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border-2 border-[#303030] focus:border-[#00C896] text-white rounded-md transition-colors duration-300"
                  />
                ) : (
                  <div className="p-3 bg-[#1A1A1A] border border-[#303030] rounded-md">
                    <p className="font-medium text-white">{userDetails.city || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Pickup Points Section */}
              <div className="pt-6 border-t border-[#303030]">
                <h3 className="text-lg font-bold text-white flex items-center mb-4">
                  <Truck className="w-5 h-5 mr-2 text-[#00C896]" />
                  Available Pickup Points {userDetails.city && `in ${userDetails.city}`}
                </h3>

                {!userDetails.city ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Please set your city to view available pickup points.</p>
                  </div>
                ) : fetchingPickupPoints ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-3 text-[#00C896]" />
                    <span className="text-gray-300 font-medium">Loading pickup points...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availablePickupPoints.map((point) => (
                      <div
                        key={point.id}
                        className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-lg ${
                          selectedPickupPoint === point.id
                            ? 'border-[#00C896] bg-[#00C896]/10 shadow-md'
                            : 'border-[#303030] hover:border-[#00C896]/50'
                        }`}
                        onClick={() => handleSelectPickupPoint(point.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="font-bold text-white">{point.name}</h4>
                              {selectedPickupPoint === point.id && (
                                <div className="ml-2 flex items-center">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-xs text-[#00C896] font-medium ml-1">Selected</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-300 mb-3">{point.location_details}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center text-[#00C896]">
                                <DollarSign className="w-3 h-3 mr-1" />
                                <span className="font-semibold">KES {point.cost.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-400 text-xs mt-2">
                              <Truck className="w-3 h-3 mr-1" />
                              <span>{point.delivery_method}</span>
                              {point.is_doorstep && (
                                <span className="ml-2 px-2 py-0.5 bg-[#00C896]/20 text-[#00C896] rounded-full text-xs font-medium">
                                  Doorstep
                                </span>
                              )}
                            </div>
                            {(point.phone_number || point.contact_person) && (
                              <div className="mt-3 pt-2 border-t border-[#303030]">
                                {point.contact_person && (
                                  <p className="text-xs text-gray-400">
                                    <span className="font-medium">Contact:</span> {point.contact_person}
                                  </p>
                                )}
                                {point.phone_number && (
                                  <p className="text-xs text-gray-400 flex items-center mt-1">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {point.phone_number}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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