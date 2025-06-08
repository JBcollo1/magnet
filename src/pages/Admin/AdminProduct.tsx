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
    fetchAdminData: () => Promise<void>;
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

    const handleCreateClick = () => {
        setCurrentProduct(null);
        setFormState({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });
        setIsFormDialogOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setCurrentProduct(product);
        setFormState({ ...product, price: Number(product.price), stock: Number(product.stock) });
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
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/admin/products/${currentProduct.id}`,
                    formState,
                    { withCredentials: true }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/admin/products`,
                    formState,
                    { withCredentials: true }
                );
            }
            fetchAdminData();
            setIsFormDialogOpen(false);
        } catch (error) {
            console.error('Failed to save product:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!currentProduct) return;
        setLoading(true);
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/admin/products/${currentProduct.id}`,
                { withCredentials: true }
            );
            fetchAdminData();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete product:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 dark:border dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-600">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-gray-900 dark:text-gray-100">Manage Products</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                            Create, update, and delete custom magnet products.
                        </CardDescription>
                    </div>
                    <Button
                        onClick={handleCreateClick}
                        className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                    >
                        Add New Product
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && !isFormDialogOpen && !isDeleteDialogOpen ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="ml-2 text-gray-700 dark:text-gray-300">Loading products...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Image</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Name</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Description</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Price (KSh)</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Stock</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allProducts.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <TableCell>
                                            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{product.name}</TableCell>
                                        <TableCell className="text-sm text-gray-500 dark:text-gray-300 max-w-[200px] truncate">{product.description}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-200">{product.price.toLocaleString()}</TableCell>
                                        <TableCell className="text-gray-700 dark:text-gray-200">{product.stock}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditClick(product)}
                                                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(product)}
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

            {/* Create/Edit Product Dialog */}
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle>{currentProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
                        <DialogDescription>
                            {currentProduct ? 'Update details for this product.' : 'Add a new custom magnet product.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-gray-700 dark:text-gray-300">Name</Label>
                            <Input
                                id="name"
                                value={formState.name}
                                onChange={handleChange}
                                className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right text-gray-700 dark:text-gray-300">Description</Label>
                            <Textarea
                                id="description"
                                value={formState.description}
                                onChange={handleChange}
                                className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right text-gray-700 dark:text-gray-300">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formState.price}
                                onChange={handleChange}
                                className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right text-gray-700 dark:text-gray-300">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formState.stock}
                                onChange={handleChange}
                                className="col-span-3 bg-white dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="imageUrl" className="text-right text-gray-700 dark:text-gray-300">Image URL</Label>
                            <Input
                                id="imageUrl"
                                value={formState.imageUrl}
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
                            className="bg-primary hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : currentProduct ? 'Save Changes' : 'Create Product'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the product "<strong>{currentProduct?.name}</strong>"? This action cannot be undone.
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

export default AdminProduct;
