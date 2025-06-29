import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProductSection from './ProductSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, Zap, Shield, Truck, Award, Users, MapPin, Clock } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";

const Index = () => {
  const navigate = useNavigate();

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

  return (
    // Base classes are for Light Mode, dark: classes for Dark Mode
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#121212] dark:text-[#E0E0E0]">
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
                {/* Hero section background and overlay for light/dark mode */}
                <div className="relative h-[70vh] bg-gradient-to-r from-teal-500/90 via-teal-500/80 to-teal-500/70">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  >
                    <div className="absolute inset-0 bg-gray-100/50 dark:bg-[#121212]/50"></div>
                  </div>
                  <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                    <div className="max-w-2xl text-gray-900 dark:text-[#E0E0E0]">
                      <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-xl md:text-2xl font-light mb-2 text-teal-600 dark:text-[#00C896]">
                        {slide.subtitle}
                      </p>
                      <p className="text-lg mb-8 max-w-xl leading-relaxed opacity-90 text-gray-700 dark:text-[#E0E0E0]">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700 text-lg px-8 py-4 font-semibold dark:bg-[#00BFA6] dark:text-[#121212] dark:hover:bg-[#1DB954]">
                          {slide.cta}
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="border-gray-700 text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-lg px-8 py-4 dark:border-[#E0E0E0] dark:text-[#E0E0E0] dark:hover:bg-[#E0E0E0] dark:hover:text-[#121212]"
                        >
                          View Gallery
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-gray-200 border-gray-300 text-gray-700 hover:bg-teal-500 hover:text-white dark:bg-[#2D2D2D] dark:border-[#303030] dark:text-[#E0E0E0] dark:hover:bg-[#00C896] dark:hover:text-[#121212]" />
          <CarouselNext className="right-4 bg-gray-200 border-gray-300 text-gray-700 hover:bg-teal-500 hover:text-white dark:bg-[#2D2D2D] dark:border-[#303030] dark:text-[#E0E0E0] dark:hover:bg-[#00C896] dark:hover:text-[#121212]" />
        </Carousel>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100 border-b border-gray-200 dark:bg-[#2D2D2D] dark:border-b dark:border-[#303030]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-[#00C896]/20">
                  <stat.icon className="h-8 w-8 text-teal-600 dark:text-[#00C896]" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 dark:text-[#E0E0E0]">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-[#E0E0E0]">Why Choose MagnetCraft Kenya?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto dark:text-gray-400">We combine quality craftsmanship with cutting-edge technology to deliver magnets that exceed expectations</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-teal-200 dark:bg-gradient-to-br dark:from-[#00C896]/20 dark:to-[#00C896]/30 dark:group-hover:shadow-[#00C896]/20">
                <Zap className="h-10 w-10 text-teal-600 dark:text-[#00C896]" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-[#E0E0E0]">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">Same-day production for orders placed before 2 PM</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-teal-200 dark:bg-gradient-to-br dark:from-[#00C896]/20 dark:to-[#00C896]/30 dark:group-hover:shadow-[#00C896]/20">
                <Shield className="h-10 w-10 text-teal-600 dark:text-[#00C896]" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-[#E0E0E0]">Premium Quality</h3>
              <p className="text-gray-600 dark:text-gray-400">UV-resistant printing with vibrant, long-lasting colors</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-teal-200 dark:bg-gradient-to-br dark:from-[#00C896]/20 dark:to-[#00C896]/30 dark:group-hover:shadow-[#00C896]/20">
                <Truck className="h-10 w-10 text-teal-600 dark:text-[#00C896]" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-[#E0E0E0]">Free Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400">Complimentary delivery within Nairobi and suburbs</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-teal-200 dark:bg-gradient-to-br dark:from-[#00C896]/20 dark:to-[#00C896]/30 dark:group-hover:shadow-[#00C896]/20">
                <Star className="h-10 w-10 text-teal-600 dark:text-[#00C896]" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-[#E0E0E0]">100% Custom</h3>
              <p className="text-gray-600 dark:text-gray-400">Unlimited design possibilities with our easy upload system</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Now using the separate component */}
      <ProductSection />

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-[#E0E0E0]">What Our Customers Say</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto dark:text-gray-400">Don't just take our word for it - hear from our satisfied customers across Kenya</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-gray-200 shadow-sm dark:bg-[#2D2D2D] dark:border-[#303030]">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-teal-500 text-teal-500 dark:fill-[#00C896] dark:text-[#00C896]" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic dark:text-gray-400">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-[#E0E0E0]">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      {/* <footer className="bg-gray-100 border-t border-gray-200 dark:bg-[#2D2D2D] dark:border-t dark:border-[#303030]">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-teal-600 dark:text-[#00C896]">MagnetCraft Kenya</h3>
              <p className="text-gray-600 mb-4 dark:text-gray-400">
                Your trusted partner for premium custom magnets and promotional materials across Kenya.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors dark:bg-[#00C896] dark:hover:bg-[#00BFA6]">
                  <span className="text-white font-bold dark:text-[#121212]">FB</span>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors dark:bg-[#1DB954] dark:hover:bg-[#00BFA6]">
                  <span className="text-white font-bold dark:text-[#121212]">IG</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg text-gray-900 dark:text-[#E0E0E0]">Quick Links</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li><a href="/about" className="hover:text-teal-600 transition-colors dark:hover:text-[#00C896]">About Us</a></li>
                <li><a href="/contact" className="hover:text-teal-600 transition-colors dark:hover:text-[#00C896]">Contact</a></li>
                <li><a href="/cart" className="hover:text-teal-600 transition-colors dark:hover:text-[#00C896]">Cart</a></li>
                <li><a href="/dashboard" className="hover:text-teal-600 transition-colors dark:hover:text-[#00C896]">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg text-gray-900 dark:text-[#E0E0E0]">Our Products</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>Custom Business Magnets</li>
                <li>Photo Magnets</li>
                <li>Promotional Magnets</li>
                <li>Decorative Magnets</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg text-gray-900 dark:text-[#E0E0E0]">Contact Info</h4>
              <div className="text-gray-600 space-y-3 dark:text-gray-400">
                <p className="flex items-center">📧 info@magnetcraft.ke</p>
                <p className="flex items-center">📱 +254 700 123 456</p>
                <p className="flex items-center">📍 Nairobi, Kenya</p>
                <p className="flex items-center">🕒 Mon-Fri: 8AM-6PM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600 dark:border-[#303030] dark:text-gray-400">
            <p>&copy; 2024 MagnetCraft Kenya. All rights reserved. | Crafted with ❤️ in Nairobi</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default Index;