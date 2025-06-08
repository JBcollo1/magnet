import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

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

    const handleEditClick = (pickupPoint: PickupPoint) => {
        setCurrentPickupPoint(pickupPoint);
        setFormState(pickupPoint);
        setIsFormDialogOpen(true);
    };

    const handleDeleteClick = (pickupPoint: PickupPoint) => {
        setCurrentPickupPoint(pickupPoint);
        setIsDeleteDialogOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormState(prevState => ({ ...prevState, [id]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (currentPickupPoint) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/admin/pickup-points/${currentPickupPoint.id}`,
                    formState,
                    { withCredentials: true }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/admin/pickup-points`,
                    formState,
                    { withCredentials: true }
                );
            }
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
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/admin/pickup-points/${currentPickupPoint.id}`,
                { withCredentials: true }
            );
            fetchAdminData();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete pickup point:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Manage Pickup Points</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                        Create, update, and delete pickup locations for orders.
                    </CardDescription>
                </div>
                <Button
                    onClick={handleCreateClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    Add New Pickup Point
                </Button>
            </CardHeader>
            <CardContent>
                {loading && !isFormDialogOpen && !isDeleteDialogOpen ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-900 dark:text-gray-100" />
                        <p className="ml-2 text-gray-700 dark:text-gray-300">Loading pickup points...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-100 dark:bg-gray-700">
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Name</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Address</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">City</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Contact Person</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Contact Phone</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allPickupPoints.map((point) => (
                                    <TableRow key={point.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{point.name}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">{point.address}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">{point.city}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">{point.contactPerson}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-300">{point.contactPhone}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditClick(point)}
                                                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(point)}
                                                    className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            {/* Create/Edit Pickup Point Dialog */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">
                            {currentPickupPoint ? 'Edit Pickup Point' : 'Create New Pickup Point'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-300">
                            {currentPickupPoint ? 'Update details for this pickup location.' : 'Add a new pickup location.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-gray-700 dark:text-gray-300">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formState.name}
                                onChange={handleChange}
                                className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right text-gray-700 dark:text-gray-300">
                                Address
                            </Label>
                            <Input
                                id="address"
                                value={formState.address}
                                onChange={handleChange}
                                className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="city" className="text-right text-gray-700 dark:text-gray-300">
                                City
                            </Label>
                            <Input
                                id="city"
                                value={formState.city}
                                onChange={handleChange}
                                className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contactPerson" className="text-right text-gray-700 dark:text-gray-300">
                                Contact Person
                            </Label>
                            <Input
                                id="contactPerson"
                                value={formState.contactPerson}
                                onChange={handleChange}
                                className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contactPhone" className="text-right text-gray-700 dark:text-gray-300">
                                Contact Phone
                            </Label>
                            <Input
                                id="contactPhone"
                                value={formState.contactPhone}
                                onChange={handleChange}
                                className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsFormDialogOpen(false)}
                            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (currentPickupPoint ? 'Save Changes' : 'Create Pickup Point')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">Confirm Delete</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete the pickup point "<strong>{currentPickupPoint?.name}</strong>"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={loading}
                            className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default AdminPickupPoint;
