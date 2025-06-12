// frontend/magnet/src/pages/Customer/CustomerProfile.tsx

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
  city: string;
  postalCode: string;
  dateJoined?: string;
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
    city: '',
    postalCode: '',
    dateJoined: user?.dateJoined || 'N/A' // Initialize from auth context
  });

  useEffect(() => {
    // Sync user details from auth context if they change
    if (user) {
      setUserDetails(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        dateJoined: user.dateJoined || prev.dateJoined // Keep previous if user.dateJoined is null
      }));
      fetchUserProfile(); // Fetch the rest of the details (phone, address etc.)
    }
  }, [user]); // Re-run if user context changes

  const fetchUserProfile = async () => {
    if (user?.role !== 'ADMIN') {
      try {
        setLoading(true); // Set loading while fetching profile data
        const response = await axios.get<UserDetails>(
          `${import.meta.env.VITE_API_URL}/profile/details`,
          { withCredentials: true }
        );

        if (response.data) {
          setUserDetails(prev => ({
            ...prev,
            ...response.data // Overwrite with fetched data
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
      await axios.put<ApiResponse<UserDetails>>(
        `${import.meta.env.VITE_API_URL}/profile/details`,
        userDetails,
        { withCredentials: true }
      );

      await refreshUser(); // Refresh user context in case name/email changed

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
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</Label>
              {isEditing ? (
                <Input
                  value={userDetails.city}
                  onChange={(e) => setUserDetails({ ...userDetails, city: e.target.value })}
                  placeholder="Nairobi"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              ) : (
                <p className="font-medium text-gray-900 dark:text-gray-100">{userDetails.city || 'Not provided'}</p>
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