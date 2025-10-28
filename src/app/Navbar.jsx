"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState("");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="bg-red-600 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center mb-2 md:mb-0">
            <a href="#home" className="flex items-center">
              <img
                src="/images/logo.png"
                alt="Company Logo"
                className="h-30 w-auto transition-transform duration-300 hover:scale-105"
              />
            </a>
          </div>
          {/* Location Input (Responsive) */}
          <div className="w-full md:w-auto mb-2 md:mb-0 md:mx-4">
            <input
              type="text"
              placeholder="Enter City/State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full md:w-60 px-4 py-2 rounded-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-medium text-lg transition-all duration-300 text-white hover:text-black relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            <a
              href="#contact"
              className="bg-white text-red-600 px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:bg-red-700 hover:text-white hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Get Started
            </a>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              className="text-gray-800 hover:text-red-600 transition-colors duration-300 p-2"
            >
              {isOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-100">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-gray-800 font-medium text-lg transition-all duration-300 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setIsOpen(false)}
            className="block text-center bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-red-700 mt-4"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
