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
  fetchAdminData: () => Promise<void>;
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

  // Mock data for demonstration
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                      Product Management
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      Manage your custom magnet inventory with style
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-2xl p-4 border border-white/30 dark:border-slate-600/30 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      <Archive className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Products</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredProducts.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-2xl p-4 border border-white/30 dark:border-slate-600/30 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">KSh {totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-700/50 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30"
            />
          </div>

          <Button
            onClick={handleCreateClick}
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Table */}
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            {loading && !isFormDialogOpen && !isDeleteDialogOpen ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Loading products...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-b-0">
                      <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-6">Product</TableHead>
                      <TableHead className="font-bold text-slate-700 dark:text-slate-200">Details</TableHead>
                      <TableHead className="font-bold text-slate-700 dark:text-slate-200">Price</TableHead>
                      <TableHead className="font-bold text-slate-700 dark:text-slate-200">Stock</TableHead>
                      <TableHead className="font-bold text-slate-700 dark:text-slate-200">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product, index) => (
                      <TableRow
                        key={product.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50 transition-all duration-300 border-b border-slate-100 dark:border-slate-700/50"
                      >
                        <TableCell className="py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 shadow-lg">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden w-full h-full flex items-center justify-center text-slate-400">
                                  📷
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-lg">{product.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">#{product.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-slate-600 dark:text-slate-300 max-w-xs line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
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
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(product)}
                              className="h-10 px-4 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 font-medium transition-all duration-200"
                            >
                              <Edit3 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(product)}
                              className="h-10 px-4 rounded-xl border-2 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400 font-medium transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
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
        </Card>
      </div>

      {/* Create/Edit Product Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl max-w-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-pink-900/20 rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="space-y-4 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                  {currentProduct ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                    {currentProduct ? 'Edit Product' : 'Create New Product'}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    {currentProduct ? 'Update the details for this product.' : 'Add a new custom magnet product to your inventory.'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Product Name</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Enter product name..."
                    className="h-12 rounded-xl border-0 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formState.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="h-12 rounded-xl border-0 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</Label>
                <Textarea
                  id="description"
                  value={formState.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  rows={4}
                  className="rounded-xl border-0 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Price (KSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formState.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="h-12 rounded-xl border-0 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formState.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="h-12 rounded-xl border-0 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-600/50 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsFormDialogOpen(false)}
                className="h-12 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentProduct ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {currentProduct ? <Edit3 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {currentProduct ? 'Save Changes' : 'Create Product'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-pink-50/30 to-orange-50/50 dark:from-red-900/20 dark:via-pink-900/10 dark:to-orange-900/20 rounded-3xl"></div>
          <div className="relative">
            <DialogHeader className="space-y-4 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Confirm Deletion
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    This action cannot be undone. The product will be permanently removed from your inventory.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-6">
              <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-700/50">
                <p className="text-slate-700 dark:text-slate-300">
                  Are you sure you want to delete <strong className="text-red-600 dark:text-red-400">"{currentProduct?.name}"</strong>?
                </p>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="h-12 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={loading}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProduct;
