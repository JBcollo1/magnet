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
  county: string; // Changed from city to county to match backend
  postalCode: string; // Assuming you'll add this to the backend if it's not there
  dateJoined?: string; // Maps to backend's 'created_at'
  lastUpdated?: string; // Maps to backend's 'updated_at'
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
    postalCode: '',
    // Initialize dateJoined and lastUpdated from auth context if available
    dateJoined: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
    lastUpdated: user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'
  });

  useEffect(() => {
    // Sync user details from auth context if they change
    if (user) {
      setUserDetails(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        dateJoined: user.created_at ? new Date(user.created_at).toLocaleDateString() : prev.dateJoined,
        lastUpdated: user.updated_at ? new Date(user.updated_at).toLocaleDateString() : prev.lastUpdated
      }));
      // Fetch the rest of the details (phone, address etc.) if not already loaded
      fetchUserProfile();
    }
  }, [user]); // Re-run if user context changes

  const fetchUserProfile = async () => {
    if (user) { // Ensure user exists before trying to fetch profile
      try {
        setLoading(true); // Set loading while fetching profile data
        const response = await axios.get<UserDetails>(
          `${import.meta.env.VITE_API_URL}/auth/profile`, // Ensure this endpoint returns all user details
          { withCredentials: true }
        );

        if (response.data) {
          setUserDetails(prev => ({
            ...prev,
            ...response.data, // Overwrite with fetched data
            // Format the dates for display
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

  const handleSaveDetails = async () => {
    setLoading(true);
    try {
      // Send only the editable fields for update
      const updatePayload = {
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone,
        address: userDetails.address,
        county: userDetails.county,
        postalCode: userDetails.postalCode,
      };

      await axios.put<ApiResponse<UserDetails>>(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        updatePayload, // Send only the updatable fields
        { withCredentials: true }
      );

      await refreshUser(); // Refresh user context to get latest updated_at from backend

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
          {/* New field for Last Updated */}
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
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</Label>
              {isEditing ? (
                <Input
                  value={userDetails.postalCode}
                  onChange={(e) => setUserDetails({ ...userDetails, postalCode: e.target.value })}
                  placeholder="00100"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.postalCode || 'Not provided'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfile;