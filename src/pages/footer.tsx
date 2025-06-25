import React from "react";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 dark:bg-[#2D2D2D] dark:border-t dark:border-[#303030]">
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
      </footer>
  )
};
export default Footer;