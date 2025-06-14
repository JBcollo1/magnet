import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CustomImage {
  id: string | number;
  url: string;
  name: string;
  file?: File; // Keep reference to original file for upload
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
}

const ProductSection = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<CustomImage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ products?: Product[] } | Product[]>(`${import.meta.env.VITE_API_URL}/products`,  { withCredentials: true });
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedImages.length > (selectedProduct?.quantity || 0)) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${selectedProduct?.quantity} images for this product.`,
        variant: "destructive"
      });
      return;
    }

    files.forEach((file: File) => {
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Please use images under 5MB.`,
          variant: "destructive"
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file.`,
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: event.target!.result as string,
            name: file.name,
            file: file // Keep reference to original file
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId: string | number) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleAddToCart = () => {
    if (uploadedImages.length === 0) {
      toast({
        title: "No images uploaded",
        description: "Please upload at least one image for your custom magnets.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedProduct) return;

    // Generate a temporary session ID for this cart item
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const customProduct = {
      ...selectedProduct,
      customImages: uploadedImages,
      sessionId, // Add session ID to track this order
      name: `${selectedProduct.name} (${uploadedImages.length} custom designs)`,
      // Add timestamp for cleanup purposes
      addedAt: new Date().toISOString()
    };

    addToCart(customProduct);
    toast({
      title: "Added to cart!",
      description: `${selectedProduct.name} with ${uploadedImages.length} custom designs has been added to your cart.`,
    });
    setDialogOpen(false);
    setSelectedProduct(null);
    setUploadedImages([]);
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive font-semibold mb-2">Error Loading Products</p>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Custom Magnet Packages</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Choose the perfect quantity for your needs. Each magnet is individually customized with your designs.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-card backdrop-blur">
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
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {product.quantity} Magnets
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl mb-3 text-foreground">{product.name}</CardTitle>
                <CardDescription className="text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </CardDescription>
                <div className="text-3xl font-bold text-primary mb-2">
                  KSh {product.price.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  KSh {Math.round(product.price / product.quantity)} per magnet
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Dialog open={dialogOpen && selectedProduct?.id === product.id} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleProductClick(product)}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Customize Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-foreground">
                        Customize Your {selectedProduct?.name}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Upload up to {selectedProduct?.quantity} images for your custom magnets. Each image will be printed on a separate magnet.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-lg font-semibold text-foreground mb-2">Click to upload images</p>
                          <p className="text-muted-foreground">or drag and drop your images here</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {uploadedImages.length} of {selectedProduct?.quantity} images uploaded
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Max 5MB per image • JPG, PNG, GIF supported
                          </p>
                        </label>
                      </div>

                      {uploadedImages.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-lg mb-4 text-foreground">Preview Your Magnets</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {uploadedImages.map((image) => (
                              <div key={image.id} className="relative group">
                                <img
                                  src={image.url}
                                  alt={image.name}
                                  className="w-full h-32 object-cover rounded-lg border-2 border-border"
                                />
                                <button
                                  onClick={() => removeImage(image.id)}
                                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddToCart}
                          disabled={uploadedImages.length === 0}
                          className="flex-1 bg-primary hover:bg-primary/90"
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