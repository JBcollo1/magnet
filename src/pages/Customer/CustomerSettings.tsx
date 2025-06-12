// frontend/magnet/src/pages/Customer/CustomerSettings.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Edit, User, Package, Settings, Heart } from 'lucide-react'; // Re-using Package for Download

const CustomerSettings = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Communication Preferences</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Manage how you receive updates and offers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</Label>
              <p className="text-xs text-gray-500 dark:text-gray-300">Receive updates about your orders</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Marketing Emails</Label>
              <p className="text-xs text-gray-500 dark:text-gray-300">Get notified about new designs and offers</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">SMS Updates</Label>
              <p className="text-xs text-gray-500 dark:text-gray-300">Receive SMS updates for order status</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Account Actions</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Manage your account security and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">
            <Edit className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">
            <Package className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
            Download Order History
          </Button>
          <Button variant="outline" className="w-full justify-start bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">
            <User className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
            Delete Account
          </Button>
          {/* Example for a theme preference button - you'd likely integrate a proper theme switcher */}
          <Button variant="outline" className="w-full justify-start bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">
            <Settings className="w-4 h-4 mr-2 text-gray-900 dark:text-gray-100" />
            Theme Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSettings;