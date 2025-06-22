import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Edit3, Trash2, Package, DollarSign, Archive, Search, Filter } from 'lucide-react';

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

const AdminProduct: React.FC<AdminProductProps> = ({ allProducts = [], fetchAdminData }) => {
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
  const [searchTerm, setSearchTerm] = useState('');

  const mockProducts = [
    {
      id: '1',
      name: 'Custom Logo Magnet',
      description: 'Premium quality custom logo magnets perfect for promotional use and branding.',
      price: 250,
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
    },
    {
      id: '2',
      name: 'Photo Frame Magnet',
      description: 'Personalized photo frame magnets - great for memories and gifts.',
      price: 180,
      stock: 23,
      imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop'
    },
    {
      id: '3',
      name: 'Business Card Magnet',
      description: 'Professional business card magnets that stick around longer than paper cards.',
      price: 320,
      stock: 67,
      imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop'
    }
  ];

  const displayProducts = allProducts.length > 0 ? allProducts : mockProducts;

  const filteredProducts = displayProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClick = () => {
    setCurrentProduct(null);
    setFormState({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (product) => {
    setCurrentProduct(product);
    setFormState({ ...product, price: Number(product.price), stock: Number(product.stock) });
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [id]: id === 'price' || id === 'stock' ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (currentProduct) {
        console.log('Updating product:', currentProduct.id, formState);
      } else {
        console.log('Creating product:', formState);
      }

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Deleting product:', currentProduct.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = filteredProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Product Management
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your custom magnet inventory with style
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700/50">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Products</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{filteredProducts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700/50">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-300">Total Value</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">KSh {totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 dark:border dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5 text-primary" />
                Products Overview
              </CardTitle>
              <CardDescription>
                View, update, and manage the status of all products
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
              />
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Processing your request...</p>
              </div>
            </div>
          )}

          {!loading && filteredProducts.length === 0 && searchTerm !== '' && (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No matching products found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
            </div>
          )}

          {!loading && filteredProducts.length === 0 && searchTerm === '' && (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No products to display</h3>
              <p className="text-muted-foreground">Products will appear here once they are added</p>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-gray-100 hover:to-gray-150 dark:hover:from-gray-600 dark:hover:to-gray-550">
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Product</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Details</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Price</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Stock</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow
                      key={product.id}
                      className={`
                        hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20
                        transition-all duration-200 border-b border-gray-100 dark:border-gray-700
                        ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750/30'}
                      `}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                            KSh {product.price.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.stock > 20
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : product.stock > 5
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {product.stock} units
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(product)}
                            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader className="pb-4 border-b dark:border-gray-600">
            <DialogTitle className="flex items-center gap-2 text-xl">
              {currentProduct ? <Edit3 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {currentProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
            <DialogDescription>
              {currentProduct ? 'Update the details for this product.' : 'Add a new custom magnet product to your inventory.'}
            </DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Product Name</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Enter product name..."
                  className="h-10 rounded-xl border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formState.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  rows={4}
                  className="rounded-xl border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">Price (KSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formState.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="h-10 rounded-xl border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formState.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="h-10 rounded-xl border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t dark:border-gray-600">
            <Button
              variant="outline"
              onClick={() => setIsFormDialogOpen(false)}
              className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {currentProduct ? 'Save Changes' : 'Create Product'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  This action cannot be undone. The product will be permanently removed from your inventory.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-6">
            <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-700/50">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <strong className="text-red-600 dark:text-red-400">"{currentProduct?.name}"</strong>?
              </p>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProduct;
