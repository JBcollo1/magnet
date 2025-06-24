import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    toast({
      title: "Message sent!",
      description: "Thank you for your message. We'll get back to you soon.",
    });
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-[#121212] dark:to-[#121212] dark:bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-400">
            Get in touch with us for custom magnet orders, quotes, or any questions you may have.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-white border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Send us a Message</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Fill out the form below and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Name *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                      className="dark:bg-[#1C1C1C] dark:text-gray-100 dark:border-[#404040]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Phone</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+254 700 123 456"
                      className="dark:bg-[#1C1C1C] dark:text-gray-100 dark:border-[#404040]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="dark:bg-[#1C1C1C] dark:text-gray-100 dark:border-[#404040]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Subject *</label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                    className="dark:bg-[#1C1C1C] dark:text-gray-100 dark:border-[#404040]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Message *</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please describe your magnet requirements or question..."
                    rows={5}
                    required
                    className="dark:bg-[#1C1C1C] dark:text-gray-100 dark:border-[#404040]"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 dark:from-[#00C896] dark:to-[#00BFA6] dark:hover:from-[#00BFA6] dark:hover:to-[#1DB954] dark:text-[#121212]"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-white border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Contact Information</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Reach out to us through any of these channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-teal-100 rounded-full p-3 dark:bg-[#00C896]/20">
                    <MapPin className="h-5 w-5 text-teal-600 dark:text-[#00C896]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Address</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      MagnetCraft Kenya<br />
                      Westlands, Nairobi<br />
                      Kenya
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-teal-100 rounded-full p-3 dark:bg-[#00C896]/20">
                    <Phone className="h-5 w-5 text-teal-600 dark:text-[#00C896]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      +254 700 123 456<br />
                      +254 711 987 654
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-teal-100 rounded-full p-3 dark:bg-[#00C896]/20">
                    <Mail className="h-5 w-5 text-teal-600 dark:text-[#00C896]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Email</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      info@magnetcraft.ke<br />
                      orders@magnetcraft.ke
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-teal-100 rounded-full p-3 dark:bg-[#00C896]/20">
                    <Clock className="h-5 w-5 text-teal-600 dark:text-[#00C896]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Business Hours</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Monday - Friday: 8:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 dark:bg-[#2D2D2D] dark:border-[#303030]">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Quick Quote Request</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Need a quick quote? Call us or send us details about your project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For faster quotes, please include:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside dark:text-gray-400">
                    <li>Type of magnet needed</li>
                    <li>Quantity required</li>
                    <li>Size specifications</li>
                    <li>Design requirements</li>
                    <li>Delivery timeline</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;