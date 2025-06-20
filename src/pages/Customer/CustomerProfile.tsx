import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
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
import { toast } from '@/hooks/use-toast';

// Mock interfaces
interface UserDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  county: string;
  dateJoined?: string;
  lastUpdated?: string;
}

interface PickupPoint {
  id: number;
  name: string;
  location_details: string;
  city?: string;
  county: string;
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

// Mock data for demonstration
const mockUser: UserDetails = {
  name: "siko  (Mock)",
  email: "Siko@gmail.com",
  phone: "+254711223344",
  address: "Mock Address, Mock City",
  county: "Kiambu",
  dateJoined: "01/15/2023",
  lastUpdated: "12/01/2024"
};

const mockPickupPoints: PickupPoint[] = [
  {
    id: 101,
    name: "Mock Kiambu Hub",
    location_details: "Mock Main St, Opp Mock Bank",
    county: "Kiambu",
    phone_number: "0700111222",
    cost: 100,
    is_doorstep: false,
    delivery_method: "Pickup",
    contact_person: "Mock Alex"
  },
  {
    id: 102,
    name: "Mock Thika Express",
    location_details: "Mock Thika Rd, Near Mock Mall",
    county: "Kiambu",
    phone_number: "0700333444",
    cost: 180,
    is_doorstep: true,
    delivery_method: "Home Delivery",
    contact_person: "Mock Brenda"
  },
  {
    id: 103,
    name: "Mock Nairobi CBD",
    location_details: "Mock Kenyatta Ave, Next to Mock Tower",
    county: "Nairobi",
    phone_number: "0700555666",
    cost: 250,
    is_doorstep: false,
    delivery_method: "Pickup",
    contact_person: "Mock Charles"
  }
];

const CustomerProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initial state derived from actual user or mock if user is null
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: user?.name || mockUser.name,
    email: user?.email || mockUser.email,
    phone: '',
    address: '',
    county: '',
    dateJoined: user?.created_at ? new Date(user.created_at).toLocaleDateString() : mockUser.dateJoined,
    lastUpdated: user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : mockUser.lastUpdated
  });

  const [availablePickupPoints, setAvailablePickupPoints] = useState<PickupPoint[]>([]);
  const [fetchingPickupPoints, setFetchingPickupPoints] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserDetails(mockUser);
    }
  }, [user]);

  useEffect(() => {
    if (userDetails.county && userDetails.county.trim() !== '') {
      fetchPickupPoints(userDetails.county);
    } else {
      setAvailablePickupPoints([]);
    }
  }, [userDetails.county]);

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
      } else {
        setUserDetails(mockUser);
        toast({
          title: "Info",
          description: "Couldn't load your profile from the server. Showing mock data.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserDetails(mockUser);
      toast({
        title: "Error",
        description: "Failed to load profile details from the server. Showing mock data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPickupPoints = async (county: string) => {
    setFetchingPickupPoints(true);
    try {
      const response = await axios.get<PickupPointsResponse>(
        `${import.meta.env.VITE_API_URL}/pickup-points/city/${county}`,
        { withCredentials: true }
      );
      if (response.data && response.data.pickup_points && response.data.pickup_points.length > 0) {
        setAvailablePickupPoints(response.data.pickup_points);
      } else {
        const filteredMockPoints = mockPickupPoints.filter(p => p.county.toLowerCase() === county.toLowerCase());
        setAvailablePickupPoints(filteredMockPoints.length > 0 ? filteredMockPoints : mockPickupPoints);
        toast({
          title: "Info",
          description: `No live pickup points for ${county}. Showing mock data.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error(`Failed to fetch pickup points for county ${county}:`, error);
      const filteredMockPoints = mockPickupPoints.filter(p => p.county.toLowerCase() === county.toLowerCase());
      setAvailablePickupPoints(filteredMockPoints.length > 0 ? filteredMockPoints : mockPickupPoints);
      toast({
        title: "Error",
        description: `Failed to load pickup points for ${county}. Showing mock data.`,
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
        county: userDetails.county,
      };
      const response = await axios.put<ApiResponse<UserDetails>>(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        updatePayload,
        { withCredentials: true }
      );
      if (response.data?.success) {
        await refreshUser();
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        toast({
          title: "Details updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        throw new Error(response.data?.message || "Profile update failed on server.");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your personal information and delivery preferences
          </p>
        </div>
        {/* Success Banner */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center animate-in slide-in-from-top-2">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-green-800 dark:text-green-200 font-medium">
              Profile updated successfully!
            </span>
          </div>
        )}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center text-xl font-semibold">
                    <User className="w-6 h-6 mr-2" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Your account details and contact information
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="bg-red-500/20 border-red-300 text-white hover:bg-red-500/30"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => isEditing ? handleSaveDetails() : setIsEditing(true)}
                    disabled={loading}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : isEditing ? (
                      <Save className="w-4 h-4 mr-2" />
                    ) : (
                      <Edit className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={userDetails.name}
                      onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                      className="border-2 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.name}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-purple-500" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      value={userDetails.email}
                      onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                      className="border-2 focus:border-purple-500 transition-colors bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.email}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-green-500" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    value={userDetails.phone}
                    onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                    placeholder="+254 700 123 456"
                    className="border-2 focus:border-green-500 transition-colors bg-white dark:bg-gray-800"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.phone || 'Not provided'}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                    Member Since
                  </Label>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <p className="font-medium text-indigo-800 dark:text-indigo-200">{userDetails.dateJoined}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    Last Updated
                  </Label>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="font-medium text-orange-800 dark:text-orange-200">{userDetails.lastUpdated}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Delivery Address Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl font-semibold">
                <MapPin className="w-6 h-6 mr-2" />
                Delivery Address
              </CardTitle>
              <CardDescription className="text-green-100">
                Your default delivery address for orders
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Street Address
                </Label>
                {isEditing ? (
                  <Textarea
                    value={userDetails.address}
                    onChange={(e) => setUserDetails({ ...userDetails, address: e.target.value })}
                    rows={3}
                    placeholder="123 Main Street, Apartment 4B"
                    className="border-2 focus:border-green-500 transition-colors bg-white dark:bg-gray-800"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.address || 'Not provided'}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  County
                </Label>
                {isEditing ? (
                  <Input
                    value={userDetails.county}
                    onChange={(e) => setUserDetails({ ...userDetails, county: e.target.value })}
                    placeholder="Kiambu"
                    className="border-2 focus:border-green-500 transition-colors bg-white dark:bg-gray-800"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.county || 'Not provided'}</p>
                  </div>
                )}
              </div>
              {/* Pickup Points Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center mb-4">
                  <Truck className="w-5 h-5 mr-2 text-blue-500" />
                  Available Pickup Points in {userDetails.county || 'your selected county'}
                </h3>
                {fetchingPickupPoints ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-3 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Loading pickup points...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availablePickupPoints.length > 0 ? (
                      availablePickupPoints.map((point) => (
                        <div
                          key={point.id}
                          className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-lg ${
                            selectedPickupPoint === point.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                          onClick={() => handleSelectPickupPoint(point.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100">{point.name}</h4>
                                {selectedPickupPoint === point.id && (
                                  <div className="ml-2 flex items-center">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium ml-1">Selected</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{point.location_details}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center text-green-600 dark:text-green-400">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  <span className="font-semibold">KES {point.cost.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center text-purple-600 dark:text-purple-400">
                                  <Truck className="w-3 h-3 mr-1" />
                                  <span>{point.delivery_method}</span>
                                  {point.is_doorstep && (
                                    <span className="ml-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                      Doorstep
                                    </span>
                                  )}
                                </div>
                              </div>
                              {(point.phone_number || point.contact_person) && (
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                  {point.contact_person && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      <span className="font-medium">Contact:</span> {point.contact_person}
                                    </p>
                                  )}
                                  {point.phone_number && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      <Phone className="w-3 h-3 inline mr-1" />
                                      {point.phone_number}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No pickup points found for this county or county not set.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
