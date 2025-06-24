import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProductSection from './ProductSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, Zap, Shield, Truck, Award, Users, MapPin, Clock, ArrowRight, Sparkles, CheckCircle, Heart } from 'lucide-react';

const Index = () => {
  // const navigate = useNavigate();
  // Mock Header Component
  const Header = () => (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50 dark:bg-gray-900/80 dark:shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            MagnetCraft Kenya
          </h1>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Home</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Products</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">About</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );

  // Mock ProductSection Component
  const ProductSection = () => (
    <section className="py-24 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Our Premium Products</h2>
          <p className="text-gray-600 text-lg dark:text-gray-300">Discover our range of high-quality custom magnets</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {['Business Magnets', 'Photo Magnets', 'Decorative Magnets'].map((product, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 dark:border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">{product[0]}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{product}</h3>
                <p className="text-gray-600 dark:text-gray-300">High-quality custom {product.toLowerCase()} for all your needs</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );

  // Simple autoplay implementation using useEffect
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);
  const plugin = React.useRef(null);

  const heroSlides = [
    {
      title: "Premium Custom Magnets",
      subtitle: "Made in Kenya with Love",
      description: "Transform your memories into stunning custom magnets. Perfect for business branding, personal keepsakes, and meaningful gifts.",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=1200&h=600&fit=crop",
      cta: "Start Customizing",
      accent: "from-purple-600 to-pink-600"
    },
    {
      title: "Business Branding Solutions",
      subtitle: "Professional Quality Guaranteed",
      description: "Elevate your brand with high-quality custom magnets. Perfect for promotional campaigns and corporate gifts.",
      image: "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=1200&h=600&fit=crop",
      cta: "For Business",
      accent: "from-blue-600 to-cyan-600"
    },
    {
      title: "Personal Memories Collection",
      subtitle: "Preserve Your Special Moments",
      description: "Create lasting memories with personalized photo magnets. Perfect for families, couples, and special occasions.",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=1200&h=600&fit=crop",
      cta: "Personal Collection",
      accent: "from-emerald-600 to-teal-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Wanjiku",
      role: "Small Business Owner",
      comment: "MagnetCraft Kenya helped me create amazing promotional magnets for my bakery. The quality is outstanding and my customers love them!",
      rating: 5,
      avatar: "SW"
    },
    {
      name: "David Kimani",
      role: "Event Planner",
      comment: "Perfect for wedding favors! Our guests loved the personalized photo magnets. Fast delivery and excellent customer service too.",
      rating: 5,
      avatar: "DK"
    },
    {
      name: "Grace Muthoni",
      role: "Marketing Manager",
      comment: "Professional service and excellent quality. Our corporate magnets look fantastic and really help with brand visibility.",
      rating: 5,
      avatar: "GM"
    }
  ];

  const stats = [
    { icon: Users, label: "Happy Customers", value: "2,500+", color: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { icon: Award, label: "Quality Rating", value: "4.9/5", color: "bg-gradient-to-br from-yellow-500 to-orange-500" },
    { icon: MapPin, label: "Cities Served", value: "15+", color: "bg-gradient-to-br from-green-500 to-emerald-600" },
    { icon: Clock, label: "Years Experience", value: "5+", color: "bg-gradient-to-br from-purple-500 to-pink-600" }
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Production",
      description: "Same-day production for orders placed before 2 PM. We value your time and deliver on our promises.",
      gradient: "from-yellow-400 via-orange-500 to-red-500",
      bgGradient: "from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10"
    },
    {
      icon: Shield,
      title: "Premium Quality Materials",
      description: "UV-resistant printing with vibrant, long-lasting colors that won't fade or crack over time.",
      gradient: "from-blue-400 via-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10"
    },
    {
      icon: Truck,
      title: "Free Delivery Service",
      description: "Complimentary delivery within Nairobi and suburbs. Fast, reliable, and always on time.",
      gradient: "from-green-400 via-emerald-500 to-teal-600",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10"
    },
    {
      icon: Sparkles,
      title: "100% Custom Design",
      description: "Unlimited design possibilities with our intuitive upload system. Your vision, perfectly realized.",
      gradient: "from-purple-400 via-pink-500 to-rose-600",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Header />
      
      {/* Hero Carousel Section - Enhanced */}
      <section className="relative overflow-hidden">
        <Carousel className="w-full">
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index} className={index === currentSlide ? "block" : "hidden"}>
                <div className="relative h-[85vh] min-h-[600px]">
                  {/* Background Image with Parallax Effect */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-105"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent} opacity-85`} />
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Content */}
                  <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                    <div className="max-w-3xl text-white">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-medium">Premium Quality Guaranteed</span>
                      </div>
                      
                      <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white to-white/90 bg-clip-text">
                        {slide.title}
                      </h1>
                      
                      <p className="text-2xl md:text-3xl font-light mb-4 text-white/90">
                        {slide.subtitle}
                      </p>
                      
                      <p className="text-xl mb-10 max-w-2xl leading-relaxed text-white/80">
                        {slide.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          size="lg" 
                          className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-6 rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 group dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                        >
                          {slide.cta}
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="border-2 border-white/50 text-white hover:bg-white hover:text-gray-900 text-lg px-10 py-6 rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300 dark:hover:bg-gray-100 dark:hover:text-gray-900"
                        >
                          View Gallery
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-1/4 right-8 w-16 h-16 bg-white/20 rounded-full blur-sm animate-pulse" />
                  <div className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-white/30 rounded-full blur-sm animate-pulse delay-1000" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Manual Navigation */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-20 dark:hover:bg-gray-100 dark:hover:text-gray-900"
          >
            ‹
          </button>
          
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-20 dark:hover:bg-gray-100 dark:hover:text-gray-900"
          >
            ›
          </button>
        </Carousel>
      </section>

      {/* Stats Section - Redesigned */}
      <section className="py-20 bg-white/70 backdrop-blur-sm border-b border-gray-200/50 dark:bg-gray-900/70 dark:border-gray-700/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`${stat.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <stat.icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:scale-105 transition-transform">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Completely Redesigned */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Star className="h-4 w-4" />
              Why Choose Us
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Excellence in Every Detail
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We combine cutting-edge technology with artisanal craftsmanship to deliver magnets that exceed your expectations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <Card className={`h-full bg-gradient-to-br ${feature.bgGradient} border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 dark:shadow-none dark:hover:shadow-xl`}>
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <ProductSection />

      {/* Testimonials Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Heart className="h-4 w-4" />
              Customer Love
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Stories from Our Family
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied customers across Kenya who trust us with their most precious memories
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group dark:bg-gray-900/80 dark:border-gray-700 dark:shadow-none dark:hover:shadow-xl">
                <CardContent className="p-8">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-8 text-lg leading-relaxed italic dark:text-gray-200">
                    "{testimonial.comment}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg dark:text-white">{testimonial.name}</p>
                      <p className="text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - New */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Ready to Create Magic?
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of happy customers and start creating your custom magnets today. 
              Your memories deserve the best quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-10 py-6 rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 group dark:bg-gray-100 dark:text-purple-700 dark:hover:bg-gray-200">
                Start Your Order
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-lg px-10 py-6 rounded-full backdrop-blur-sm bg-white/10 dark:hover:bg-gray-100 dark:hover:text-purple-700">
                Get Free Quote
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/20 rounded-full blur-xl animate-pulse delay-1000" />
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-gray-900 text-white relative overflow-hidden dark:bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-gray-950 dark:via-gray-900 dark:to-black" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MagnetCraft Kenya
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your trusted partner for premium custom magnets and promotional materials across Kenya. 
                Crafting memories that last a lifetime.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="text-white font-bold">FB</span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="text-white font-bold">IG</span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="text-white font-bold">WA</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-xl text-white">Quick Links</h4>
              <ul className="space-y-4 text-gray-300">
                {['About Us', 'Contact', 'Cart', 'Dashboard'].map((link) => (
                  <li key={link}>
                    <a href={`/${link.toLowerCase().replace(' ', '')}`} className="hover:text-white transition-colors flex items-center group">
                      <CheckCircle className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-xl text-white">Our Products</h4>
              <ul className="space-y-4 text-gray-300">
                {['Custom Business Magnets', 'Photo Magnets', 'Promotional Magnets', 'Decorative Magnets'].map((product) => (
                  <li key={product} className="flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3" />
                    {product}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-xl text-white">Get in Touch</h4>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm">
                    📧
                  </div>
                  <span>info@magnetcraft.ke</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-sm">
                    📱
                  </div>
                  <span>+254 700 123 456</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center text-sm">
                    📍
                  </div>
                  <span>Nairobi, Kenya</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-sm">
                    🕒
                  </div>
                  <span>Mon-Fri: 8AM-6PM</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center dark:border-gray-600">
            <p className="text-gray-400">
              &copy; 2024 MagnetCraft Kenya. All rights reserved. | Crafted with 
              <span className="text-red-400 mx-1">❤️</span> 
              in Nairobi
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;