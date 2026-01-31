import React from "react";
import Navbar from "../components/Navbar";

function HomeLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-black/60 backdrop-blur-xl text-gray-400 py-12 mt-20 border-t border-red-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-4">Ride On Go</h3>
              <p className="text-sm text-gray-400">
                Your trusted partner for bike rentals. Experience the freedom
                of two wheels.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-gray-400 hover:text-red-500 transition-colors">Home</a></li>
                <li><a href="/bikes" className="text-gray-400 hover:text-red-500 transition-colors">Our Bikes</a></li>
                <li><a href="/about" className="text-gray-400 hover:text-red-500 transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-red-500 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-red-500 transition-colors">FAQs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-red-500 transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="text-gray-400 hover:text-red-500 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><span className="text-red-500">📍</span> 123 Bike Street, City</li>
                <li className="flex items-center gap-2"><span className="text-red-500">📞</span> +91 98765 43210</li>
                <li className="flex items-center gap-2"><span className="text-red-500">✉️</span> info@rideongo.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 Ride On Go. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomeLayout;
