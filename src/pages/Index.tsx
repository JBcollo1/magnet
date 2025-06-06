
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Star, Zap, Shield, Truck, Upload, X, Award, Users, MapPin, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Autoplay from "embla-carousel-autoplay";

interface CustomImage {
  id: string | number;
  url: string;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
}

const Index = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<CustomImage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Add autoplay plugin
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const heroSlides = [
    {
      title: "Premium Custom Magnets",
      subtitle: "Made in Kenya with Love",
      description: "Transform your memories into stunning custom magnets. Perfect for business branding, personal keepsakes, and meaningful gifts.",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=1200&h=600&fit=crop",
      cta: "Start Customizing"
    },
    {
      title: "Business Branding Solutions",
      subtitle: "Professional Quality Guaranteed",
      description: "Elevate your brand with high-quality custom magnets. Perfect for promotional campaigns and corporate gifts.",
      image: "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=1200&h=600&fit=crop",
      cta: "For Business"
    },
    {
      title: "Personal Memories Collection",
      subtitle: "Preserve Your Special Moments",
      description: "Create lasting memories with personalized photo magnets. Perfect for families, couples, and special occasions.",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=1200&h=600&fit=crop",
      cta: "Personal Collection"
    }
  ];

  const products = [
    {
      id: 1,
      name: "4-CUSTOM MAGNETS",
      price: 800,
      quantity: 4,
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop",
      description: "You get 4 separate custom magnets, each magnet can feature a different image/design or the same one repeated"
    },
    {
      id: 2,
      name: "6-CUSTOM MAGNETS",
      price: 1200,
      quantity: 6,
      image: "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=400&h=300&fit=crop",
      description: "You get 6 custom-made magnets with your own designs"
    },
    {
      id: 3,
      name: "9-CUSTOM MAGNETS",
      price: 1700,
      quantity: 9,
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop",
      description: "You get 9 custom magnets perfect for larger collections"
    },
    {
      id: 4,
      name: "12-CUSTOM MAGNETS",
      price: 2200,
      quantity: 12,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      description: "You get 12 custom magnets ideal for families or businesses"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Wanjiku",
      role: "Small Business Owner",
      comment: "MagnetCraft Kenya helped me create amazing promotional magnets for my bakery. The quality is outstanding!",
      rating: 5
    },
    {
      name: "David Kimani",
      role: "Event Planner",
      comment: "Perfect for wedding favors! Our guests loved the personalized photo magnets. Fast delivery too.",
      rating: 5
    },
    {
      name: "Grace Muthoni",
      role: "Marketing Manager",
      comment: "Professional service and excellent quality. Our corporate magnets look fantastic on office fridges.",
      rating: 5
    }
  ];

  const stats = [
    { icon: Users, label: "Happy Customers", value: "2,500+" },
    { icon: Award, label: "Quality Rating", value: "4.9/5" },
    { icon: MapPin, label: "Cities Served", value: "15+" },
    { icon: Clock, label: "Years Experience", value: "5+" }
  ];

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
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: event.target!.result as string,
            name: file.name
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

    const customProduct = {
      ...selectedProduct,
      customImages: uploadedImages,
      name: `${selectedProduct.name} (${uploadedImages.length} custom designs)`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden">
        <Carousel 
          className="w-full"
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[70vh] bg-gradient-to-r from-primary/90 via-primary/80 to-primary/70">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  >
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
                  </div>
                  <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                    <div className="max-w-2xl text-white">
                      <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-xl md:text-2xl font-light mb-2 text-purple-200">
                        {slide.subtitle}
                      </p>
                      <p className="text-lg mb-8 max-w-xl leading-relaxed opacity-90">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4">
                          {slide.cta}
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4">
                          View Gallery
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Why Choose MagnetCraft Kenya?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">We combine quality craftsmanship with cutting-edge technology to deliver magnets that exceed expectations</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg">
                <Zap className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-foreground">Lightning Fast</h3>
              <p className="text-muted-foreground">Same-day production for orders placed before 2 PM</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg">
                <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-foreground">Premium Quality</h3>
              <p className="text-muted-foreground">UV-resistant printing with vibrant, long-lasting colors</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg">
                <Truck className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-foreground">Free Delivery</h3>
              <p className="text-muted-foreground">Complimentary delivery within Nairobi and suburbs</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg">
                <Star className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-foreground">100% Custom</h3>
              <p className="text-muted-foreground">Unlimited design possibilities with our easy upload system</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
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

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">What Our Customers Say</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Don't just take our word for it - hear from our satisfied customers across Kenya</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-primary">MagnetCraft Kenya</h3>
              <p className="text-muted-foreground mb-4">
                Your trusted partner for premium custom magnets and promotional materials across Kenya.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">FB</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">IG</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg text-foreground">Quick Links</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="/cart" className="hover:text-foreground transition-colors">Cart</a></li>
                <li><a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg text-foreground">Our Products</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>Custom Business Magnets</li>
                <li>Photo Magnets</li>
                <li>Promotional Magnets</li>
                <li>Decorative Magnets</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg text-foreground">Contact Info</h4>
              <div className="text-muted-foreground space-y-3">
                <p className="flex items-center">📧 info@magnetcraft.ke</p>
                <p className="flex items-center">📱 +254 700 123 456</p>
                <p className="flex items-center">📍 Nairobi, Kenya</p>
                <p className="flex items-center">🕒 Mon-Fri: 8AM-6PM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 MagnetCraft Kenya. All rights reserved. | Crafted with ❤️ in Nairobi</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
