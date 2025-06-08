// frontend/magnet/src/pages/Admin/AdminPickupPoint.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
// import { useToast } from '@/components/ui/use-toast'; // Uncomment if you have toast notifications

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

    // const { toast } = useToast(); // Uncomment if you have toast notifications

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
                // Update existing pickup point
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/pickup-points/${currentPickupPoint.id}`,
                    formState,
                    { withCredentials: true }
                );
                // toast({ title: 'Pickup Point Updated', description: `${formState.name} has been updated.` }); // Uncomment
            } else {
                // Create new pickup point
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/pickup-points`,
                    formState,
                    { withCredentials: true }
                );
                // toast({ title: 'Pickup Point Created', description: `${formState.name} has been added.` }); // Uncomment
            }
            fetchAdminData();
            setIsFormDialogOpen(false);
        } catch (error) {
            console.error('Failed to save pickup point:', error);
            // toast({ title: 'Error', description: 'Failed to save pickup point.', variant: 'destructive' }); // Uncomment
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!currentPickupPoint) return;
        setLoading(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/pickup-points/${currentPickupPoint.id}`,
                { withCredentials: true }
            );
            // toast({ title: 'Pickup Point Deleted', description: `${currentPickupPoint.name} has been deleted.` }); // Uncomment
            fetchAdminData();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete pickup point:', error);
            // toast({ title: 'Error', description: 'Failed to delete pickup point.', variant: 'destructive' }); // Uncomment
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Manage Pickup Points</CardTitle>
                    <CardDescription>Create, update, and delete pickup locations for orders.</CardDescription>
                </div>
                <Button onClick={handleCreateClick}>Add New Pickup Point</Button>
            </CardHeader>
            <CardContent>
                {loading && !isFormDialogOpen && !isDeleteDialogOpen ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="ml-2">Loading pickup points...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Contact Phone</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allPickupPoints.map((point) => (
                                <TableRow key={point.id}>
                                    <TableCell className="font-medium">{point.name}</TableCell>
                                    <TableCell>{point.address}</TableCell>
                                    <TableCell>{point.city}</TableCell>
                                    <TableCell>{point.contactPerson}</TableCell>
                                    <TableCell>{point.contactPhone}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(point)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(point)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Create/Edit Pickup Point Dialog */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentPickupPoint ? 'Edit Pickup Point' : 'Create New Pickup Point'}</DialogTitle>
                        <DialogDescription>
                            {currentPickupPoint ? 'Update details for this pickup location.' : 'Add a new pickup location.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" value={formState.name} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">
                                Address
                            </Label>
                            <Input id="address" value={formState.address} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="city" className="text-right">
                                City
                            </Label>
                            <Input id="city" value={formState.city} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contactPerson" className="text-right">
                                Contact Person
                            </Label>
                            <Input id="contactPerson" value={formState.contactPerson} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contactPhone" className="text-right">
                                Contact Phone
                            </Label>
                            <Input id="contactPhone" value={formState.contactPhone} onChange={handleChange} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (currentPickupPoint ? 'Save Changes' : 'Create Pickup Point')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the pickup point "<strong>{currentPickupPoint?.name}</strong>"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default AdminPickupPoint;