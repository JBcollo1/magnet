import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, Save, Loader2, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  county: string; // Changed from city to county
  // postalCode: string; // Removed as per your request for pickup points, but keeping for user's own address if needed
  dateJoined?: string; // Maps to backend's 'created_at'
  lastUpdated?: string; // Maps to backend's 'updated_at'
}

interface PickupPoint {
  id: number;
  name: string;
  address: string;
  county: string;
  phone?: string;
  email?: string;
  operating_hours?: string;
  // Add other pickup point properties as needed
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
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    county: '', 
    dateJoined: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
    lastUpdated: user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'
  });

  // State to hold available pickup points based on the user's selected county
  const [availablePickupPoints, setAvailablePickupPoints] = useState<PickupPoint[]>([]);
  const [fetchingPickupPoints, setFetchingPickupPoints] = useState(false);

  useEffect(() => {
    if (user) {
      setUserDetails(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        dateJoined: user.created_at ? new Date(user.created_at).toLocaleDateString() : prev.dateJoined,
        lastUpdated: user.updated_at ? new Date(user.updated_at).toLocaleDateString() : prev.lastUpdated
      }));
      fetchUserProfile();
    }
  }, [user]);

  // New useEffect to fetch pickup points when userDetails.county changes
  useEffect(() => {
    if (userDetails.county && userDetails.county !== '') {
      fetchPickupPoints(userDetails.county);
    } else {
      setAvailablePickupPoints([]); // Clear pickup points if no county is set
    }
  }, [userDetails.county]); // Dependency on userDetails.county

  const fetchUserProfile = async () => {
    if (user) {
      try {
        setLoading(true);
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
          description: "Failed to load profile details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchPickupPoints = async (county: string) => {
    setFetchingPickupPoints(true);
    try {
      const response = await axios.get<PickupPointsResponse>(
        `${import.meta.env.VITE_API_URL}/pickup-points/county/${county}`, // Updated endpoint
        { withCredentials: true }
      );
      
      if (response.data && response.data.pickup_points) {
        setAvailablePickupPoints(response.data.pickup_points);
      } else {
        setAvailablePickupPoints([]);
      }
    } catch (error) {
      console.error(`Failed to fetch pickup points for county ${county}:`, error);
      toast({
        title: "Error",
        description: `Failed to load pickup points for ${county}.`,
        variant: "destructive",
      });
      setAvailablePickupPoints([]);
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
        // Removed postalCode from the update payload if it's not relevant to user's address anymore
      };

      await axios.put<ApiResponse<UserDetails>>(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        updatePayload,
        { withCredentials: true }
      );

      await refreshUser();

      setIsEditing(false);
      toast({
        title: "Details updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-gray-900 dark:text-gray-100" />
        <span className="text-gray-700 dark:text-gray-300">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gray-900 dark:text-gray-100">Personal Information</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">Your account details and contact information</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => isEditing ? handleSaveDetails() : setIsEditing(true)}
              disabled={loading}
              className="bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-900 dark:text-gray-100" />
              ) : isEditing ? (
                <Save className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
              ) : (
                <Edit className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
              )}
              {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
              {isEditing ? (
                <Input
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.name}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
              {isEditing ? (
                <Input
                  value={userDetails.email}
                  onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.email}</p>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
            {isEditing ? (
              <Input
                value={userDetails.phone}
                onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                placeholder="+254 700 123 456"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            ) : (
              <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.phone || 'Not provided'}</p>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</Label>
            <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.dateJoined}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</Label>
            <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.lastUpdated}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
            <MapPin className="w-5 h-5 mr-2 text-gray-900 dark:text-gray-100" />
            Delivery Address
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Your default delivery address for orders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</Label>
            {isEditing ? (
              <Textarea
                value={userDetails.address}
                onChange={(e) => setUserDetails({ ...userDetails, address: e.target.value })}
                rows={2}
                placeholder="123 Main Street, Apartment 4B"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            ) : (
              <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.address || 'Not provided'}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">County</Label>
              {isEditing ? (
                <Input
                  value={userDetails.county}
                  onChange={(e) => setUserDetails({ ...userDetails, county: e.target.value })}
                  placeholder="Kiambu"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.county || 'Not provided'}</p>
              )}
            </div>
            {/* Removed Postal Code field for the user's address as per the request, 
                assuming it's no longer needed for identifying pickuppoints.
                If the user's *own* address still needs a postal code, keep this section.
                For now, I've removed it for the context of pickup points.
            */}
          </div>

          {/* New Section for Pickup Points based on County */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <MapPin className="w-4 h-4 mr-2" /> Available Pickup Points in {userDetails.county || 'your selected county'}
            </h3>
            <CardDescription className="text-gray-600 dark:text-gray-300">
                Select a pickup point for your orders.
            </CardDescription>
            {fetchingPickupPoints ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2 text-gray-900 dark:text-gray-100" />
                <span className="text-gray-700 dark:text-gray-300">Loading pickup points...</span>
              </div>
            ) : (
              <div className="space-y-2 mt-4">
                {availablePickupPoints.length > 0 ? (
                  availablePickupPoints.map((point) => (
                    <div key={point.id} className="p-3 border rounded-md dark:border-gray-700 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{point.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{point.address}</p>
                      {point.phone && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone: {point.phone}</p>
                      )}
                      {point.operating_hours && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Hours: {point.operating_hours}</p>
                      )}
                      {/* You might want a mechanism to actually *select* a pickup point here */}
                      {/* For example, a radio button or a select button */}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No pickup points found for this county or county not set.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfile;