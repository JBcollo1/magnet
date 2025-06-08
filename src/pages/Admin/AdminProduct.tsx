// frontend/magnet/src/pages/Admin/AdminProduct.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
// import { useToast } from '@/components/ui/use-toast'; // Uncomment if you have toast notifications

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
}

interface AdminProductProps {
    allProducts: Product[];
    fetchAdminData: () => void;
}

const AdminProduct: React.FC<AdminProductProps> = ({ allProducts, fetchAdminData }) => {
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [formState, setFormState] = useState<Omit<Product, 'id'>>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);

    // const { toast } = useToast(); // Uncomment if you have toast notifications

    const handleCreateClick = () => {
        setCurrentProduct(null);
        setFormState({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });
        setIsFormDialogOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setCurrentProduct(product);
        setFormState(product);
        setIsFormDialogOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setCurrentProduct(product);
        setIsDeleteDialogOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [id]: id === 'price' || id === 'stock' ? Number(value) : value
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (currentProduct) {
                // Update existing product
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/products/${currentProduct.id}`,
                    formState,
                    { withCredentials: true }
                );
                // toast({ title: 'Product Updated', description: `${formState.name} has been updated.` }); // Uncomment
            } else {
                // Create new product
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/products`,
                    formState,
                    { withCredentials: true }
                );
                // toast({ title: 'Product Created', description: `${formState.name} has been added.` }); // Uncomment
            }
            fetchAdminData();
            setIsFormDialogOpen(false);
        } catch (error) {
            console.error('Failed to save product:', error);
            // toast({ title: 'Error', description: 'Failed to save product.', variant: 'destructive' }); // Uncomment
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!currentProduct) return;
        setLoading(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/products/${currentProduct.id}`,
                { withCredentials: true }
            );
            // toast({ title: 'Product Deleted', description: `${currentProduct.name} has been deleted.` }); // Uncomment
            fetchAdminData();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete product:', error);
            // toast({ title: 'Error', description: 'Failed to delete product.', variant: 'destructive' }); // Uncomment
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Manage Products</CardTitle>
                    <CardDescription>Create, update, and delete products from your inventory.</CardDescription>
                </div>
                <Button onClick={handleCreateClick}>Add New Product</Button>
            </CardHeader>
            <CardContent>
                {loading && !isFormDialogOpen && !isDeleteDialogOpen ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="ml-2">Loading products...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <img src={product.imageUrl} alt={product.name} className="h-12 w-12 object-cover rounded-md" />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="max-w-[200px] truncate text-sm">{product.description}</TableCell>
                                    <TableCell>KSh {product.price.toLocaleString()}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Create/Edit Product Dialog */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
                        <DialogDescription>
                            {currentProduct ? 'Update details for this product.' : 'Add a new product to your inventory.'}
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
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea id="description" value={formState.description} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price (KSh)
                            </Label>
                            <Input id="price" type="number" value={formState.price} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">
                                Stock
                            </Label>
                            <Input id="stock" type="number" value={formState.stock} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="imageUrl" className="text-right">
                                Image URL
                            </Label>
                            <Input id="imageUrl" value={formState.imageUrl} onChange={handleChange} className="col-span-3" placeholder="e.g., /images/product.jpg" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (currentProduct ? 'Save Changes' : 'Create Product')}
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
                            Are you sure you want to delete the product "<strong>{currentProduct?.name}</strong>"? This action cannot be undone.
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

export default AdminProduct;