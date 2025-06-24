import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Upload, X, Loader2, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CustomImage {
  id: string | number;
  url: string;
  name: string;
  file?: File;
  uploadStatus?: 'uploading' | 'pending' | 'approved' | 'rejected' | 'error';
  approvalStatus?: string;
  rejectionReason?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
}
interface CartCustomImage {
  id: string | number;
  url: string;
  name: string;
  uploadStatus?: 'approved' | 'pending' | 'uploading' | 'error';
}
// API Response type for image upload
interface ImageUploadResponse {
  id: string | number;
  image_url: string;
  image_name: string;
  approval_status: string;
}

const ProductSection = () => {
  const { addToCart, addCustomProductToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<CustomImage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ products?: Product[] } | Product[]>(`${import.meta.env.VITE_API_URL}/products`, { withCredentials: true });
        const data = response.data;
        if (Array.isArray(data)) {
          setProducts(data as Product[]);
        } else if (data && Array.isArray((data as { products?: Product[] }).products)) {
          setProducts((data as { products: Product[] }).products);
        } else {
          setProducts([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load products. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setUploadedImages([]);
    setDialogOpen(true);
  };
const uploadImageToAPI = async (file: File): Promise<CustomImage> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    // Use the temporary upload endpoint
    const response = await axios.post<ImageUploadResponse>(`${import.meta.env.VITE_API_URL}/temp-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
    });

    return {
      id: response.data.id,
      url: response.data.image_url,
      name: response.data.image_name,
      uploadStatus: 'pending',
      approvalStatus: response.data.approval_status
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedImages.length > (selectedProduct?.quantity || 0)) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${selectedProduct?.quantity} images for this product.`,
        variant: "destructive"
      });
      return;
    }

    // Validate files first
    const validFiles = files.filter((file: File) => {
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Please use images under 5MB.`,
          variant: "destructive"
        });
        return false;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file.`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setUploadingCount(validFiles.length);

      // Upload files sequentially to avoid overwhelming the server
      for (const file of validFiles) {
        // Add image with uploading status immediately
        const tempImage: CustomImage = {
          id: Date.now() + Math.random(),
          url: URL.createObjectURL(file),
          name: file.name,
          file: file,
          uploadStatus: 'uploading'
        };

        setUploadedImages(prev => [...prev, tempImage]);

        try {
          // Upload to API
          const uploadedImage = await uploadImageToAPI(file);
          
          // Update the image with API response
          setUploadedImages(prev => 
            prev.map(img => 
              img.id === tempImage.id 
                ? { ...uploadedImage, file: file }
                : img
            )
          );

          toast({
            title: "Image uploaded successfully",
            description: `${file.name} has been uploaded and is pending approval.`,
          });

        } catch (error) {
          // Update image with error status
          setUploadedImages(prev => 
            prev.map(img => 
              img.id === tempImage.id 
                ? { ...img, uploadStatus: 'error' }
                : img
            )
          );

          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive"
          });
        }

        setUploadingCount(prev => prev - 1);
      }

    } catch (error) {
      console.error('Error in image upload process:', error);
      toast({
        title: "Upload error",
        description: "Failed to start upload process. Please try again.",
        variant: "destructive"
      });
      setUploadingCount(0);
    }
  };
const removeImage = async (imageId: string | number) => {
  const imageToRemove = uploadedImages.find(img => img.id === imageId);
  
  if (imageToRemove && imageToRemove.uploadStatus !== 'uploading') {
    try {
      // Delete from API using temp endpoint
      await axios.delete(`${import.meta.env.VITE_API_URL}/temp-images/${imageToRemove.id}`, {
        withCredentials: true
      });
      
      toast({
        title: "Image removed",
        description: `${imageToRemove.name} has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting image from API:', error);
      toast({
        title: "Deletion failed",
        description: "Failed to remove image from server, but removed from local view.",
        variant: "destructive"
      });
    }
  }

  setUploadedImages(prev => prev.filter(img => img.id !== imageId));
};


  const getImageStatusIcon = (status?: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getImageStatusText = (status?: string) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'pending':
        return 'Pending approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'error':
        return 'Upload failed';
      default:
        return '';
    }
  };
  const handleAddToCart = async () => {
  
  const approvedImages = uploadedImages.filter(img => img.uploadStatus === 'approved');
  const pendingImages = uploadedImages.filter(img => img.uploadStatus === 'pending');
  const uploadingImages = uploadedImages.filter(img => img.uploadStatus === 'uploading');
  const errorImages = uploadedImages.filter(img => img.uploadStatus === 'error');

  if (uploadingImages.length > 0) {
    toast({
      title: "Upload in progress",
      description: "Please wait for all images to finish uploading.",
      variant: "destructive"
    });
    return;
  }

  if (errorImages.length > 0) {
    toast({
      title: "Upload errors",  
      description: "Please fix upload errors before adding to cart.",
      variant: "destructive"
    });
    return;
  }

  if (approvedImages.length === 0 && pendingImages.length === 0) {
    toast({
      title: "No images uploaded",
      description: "Please upload at least one image for your custom product.",
      variant: "destructive"
    });
    return;
  }

  if (!selectedProduct) return;

  try {
    const orderData = {
      order_items: [
        {
          product_id: selectedProduct.id,
          quantity: products.find(p => p.id === selectedProduct.id)?.quantity || 1,
        }
      ]
    };

    const response = await axios.post<{ id: string | number }>(
      `${import.meta.env.VITE_API_URL}/orders`,
      orderData,
      {
        withCredentials: true
      }
    ); 

    // Convert CustomImage to CartCustomImage format
    const cartCustomImages: CartCustomImage[] = [...approvedImages, ...pendingImages].map(img => ({
      id: img.id,
      url: img.url,
      name: img.name,
      // Only include valid uploadStatus values for CartCustomImage
      uploadStatus: (img.uploadStatus === 'approved' || 
                    img.uploadStatus === 'pending' || 
                    img.uploadStatus === 'uploading' || 
                    img.uploadStatus === 'error') 
        ? img.uploadStatus 
        : 'pending'
    }));

    const customProduct = {
      ...selectedProduct,
      customImages: cartCustomImages,
      name: `${selectedProduct.name} (${approvedImages.length + pendingImages.length} custom designs)`,
      addedAt: new Date().toISOString(),
      approvedCount: approvedImages.length,
      pendingCount: pendingImages.length,
      orderId: response.data.id
    };

    // Fixed: Removed duplicate call
    addCustomProductToCart(customProduct);

    let message = `${selectedProduct.name} with ${approvedImages.length + pendingImages.length} custom designs has been added to your cart.`;
    if (pendingImages.length > 0) {
      message += ` ${pendingImages.length} images are still pending approval.`;
    }

    toast({
      title: "Added to cart!",
      description: message,
    });

    setDialogOpen(false);
    setSelectedProduct(null);
    setUploadedImages([]);

  } catch (error) {
    console.error('Error creating order:', error);
    toast({
      title: "Error",
      description: "Failed to add item to cart. Please try again.",
      variant: "destructive"
    });
  }
};
useEffect(() => {
  return () => {
    // Cleanup unused temp images when component unmounts
    const unusedImages = uploadedImages.filter(img => 
      img.uploadStatus === 'pending' || img.uploadStatus === 'approved'
    );
    
    unusedImages.forEach(async (img) => {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/temp-images/${img.id}`, {
          withCredentials: true
        });
      } catch (error) {
        console.error('Error cleaning up temp image:', error);
      }
    });
  };
}, []);
  const canAddToCart = () => {
    const hasValidImages = uploadedImages.some(img => 
      img.uploadStatus === 'approved' || img.uploadStatus === 'pending'
    );
    const hasUploadingImages = uploadedImages.some(img => img.uploadStatus === 'uploading');
    const hasErrorImages = uploadedImages.some(img => img.uploadStatus === 'error');
    
    return hasValidImages && !hasUploadingImages && !hasErrorImages;
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-teal-600 dark:text-primary" />
              <p className="text-gray-600 dark:text-muted-foreground">Loading products...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500 dark:text-destructive" />
              <p className="text-red-600 font-semibold mb-2 dark:text-destructive">Error Loading Products</p>
              <p className="text-gray-600 mb-4 dark:text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700 dark:bg-primary dark:hover:bg-primary/90">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-foreground">Custom Magnet Packages</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto dark:text-muted-foreground">Choose the perfect quantity for your needs. Each magnet is individually customized with your designs.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 bg-white dark:border-0 dark:bg-card dark:backdrop-blur">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      // Fallback image if product image fails to load
                      e.currentTarget.src = '/placeholder-product.jpg';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold dark:bg-primary dark:text-primary-foreground">
                    {product.quantity} Magnets
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl mb-3 text-gray-900 dark:text-foreground">{product.name}</CardTitle>
                <CardDescription className="text-gray-600 mb-4 line-clamp-2 dark:text-muted-foreground">
                  {product.description}
                </CardDescription>
                <div className="text-3xl font-bold text-teal-700 mb-2 dark:text-primary">
                  KSh {product.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-muted-foreground">
                  KSh {Math.round(product.price / product.quantity)} per magnet
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Dialog open={dialogOpen && selectedProduct?.id === product.id} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleProductClick(product)}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 dark:from-primary dark:to-primary/80 dark:hover:from-primary/90 dark:hover:to-primary/70 dark:text-primary-foreground"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Customize Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-background">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-foreground">
                        Customize Your {selectedProduct?.name}
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 dark:text-muted-foreground">
                        Upload up to {selectedProduct?.quantity} images for your custom magnets. Each image will be printed on a separate magnet.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors dark:border-border dark:hover:border-primary">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4 dark:text-muted-foreground" />
                          <p className="text-lg font-semibold text-gray-900 mb-2 dark:text-foreground">Click to upload images</p>
                          <p className="text-gray-600 dark:text-muted-foreground">or drag and drop your images here</p>
                          <p className="text-sm text-gray-500 mt-2 dark:text-muted-foreground">
                            {uploadedImages.length} of {selectedProduct?.quantity} images uploaded
                          </p>
                          <p className="text-xs text-gray-500 mt-1 dark:text-muted-foreground">
                            Max 5MB per image • JPG, PNG, GIF supported
                          </p>
                        </label>
                      </div>

                      {uploadedImages.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-foreground">Preview Your Magnets</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {uploadedImages.map((image) => (
                              <div key={image.id} className="relative group">
                                <div className="relative">
                                  <img
                                    src={image.url}
                                    alt={image.name}
                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-border"
                                  />
                                  <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                                    {getImageStatusIcon(image.uploadStatus)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeImage(image.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity dark:bg-destructive dark:text-destructive-foreground"
                                  disabled={image.uploadStatus === 'uploading'}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <div className="mt-1 text-xs text-center text-gray-500 dark:text-muted-foreground">
                                  {getImageStatusText(image.uploadStatus)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddToCart}
                          disabled={!canAddToCart() || uploadedImages.length === 0}
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white dark:bg-primary dark:hover:bg-primary/90"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart - KSh {selectedProduct?.price.toLocaleString()}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;