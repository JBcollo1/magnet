import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Users, Clock, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-[#121212] dark:to-[#121212] dark:bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">About MagnetCraft Kenya</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto dark:text-gray-400">
            We are Kenya's leading custom magnet manufacturer, specializing in high-quality promotional 
            and decorative magnets for businesses and individuals across the country.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Our Story</h2>
            <p className="text-gray-600 mb-4 dark:text-gray-400">
              Founded in 2020, MagnetCraft Kenya started with a simple vision: to provide high-quality, 
              affordable custom magnets to businesses and individuals across Kenya. What began as a small 
              operation has grown into the country's most trusted magnet manufacturing company.
            </p>
            <p className="text-gray-600 mb-4 dark:text-gray-400">
              We understand the power of magnetic marketing and the lasting impression that quality 
              magnets can make. Whether you're a business looking to promote your brand or an individual 
              wanting to preserve precious memories, we have the expertise and technology to bring your 
              vision to life.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Today, we serve hundreds of satisfied customers across Kenya, from small local businesses 
              to large corporations, helping them create memorable and effective magnetic marketing materials.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Why Choose Us?</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-teal-100 rounded-full p-2 mr-3 mt-1 dark:bg-[#00C896]/20">
                  <Award className="h-4 w-4 text-teal-600 dark:text-[#00C896]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Premium Quality</h4>
                  <p className="text-gray-600 text-sm dark:text-gray-400">We use only the finest materials and state-of-the-art printing technology.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-teal-100 rounded-full p-2 mr-3 mt-1 dark:bg-[#00C896]/20">
                  <Clock className="h-4 w-4 text-teal-600 dark:text-[#00C896]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Fast Turnaround</h4>
                  <p className="text-gray-600 text-sm dark:text-gray-400">Quick production and delivery to meet your deadlines.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-teal-100 rounded-full p-2 mr-3 mt-1 dark:bg-[#00C896]/20">
                  <Users className="h-4 w-4 text-teal-600 dark:text-[#00C896]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Expert Support</h4>
                  <p className="text-gray-600 text-sm dark:text-gray-400">Our design team helps you create the perfect magnet for your needs.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-teal-100 rounded-full p-2 mr-3 mt-1 dark:bg-[#00C896]/20">
                  <Globe className="h-4 w-4 text-teal-600 dark:text-[#00C896]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Nationwide Delivery</h4>
                  <p className="text-gray-600 text-sm dark:text-gray-400">We deliver to all major cities and towns across Kenya.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
            <CardHeader>
              <CardTitle className="text-center text-gray-900 dark:text-gray-100">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                To provide exceptional custom magnet solutions that help businesses grow and 
                individuals preserve their precious memories through innovative, high-quality products.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
            <CardHeader>
              <CardTitle className="text-center text-gray-900 dark:text-gray-100">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                To be East Africa's leading custom magnet manufacturer, known for quality, 
                innovation, and exceptional customer service.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
            <CardHeader>
              <CardTitle className="text-center text-gray-900 dark:text-gray-100">Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                Quality, integrity, innovation, and customer satisfaction drive everything we do. 
                We believe in building lasting relationships with our clients.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;