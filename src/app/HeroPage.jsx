"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Users, Clock, Shield } from 'lucide-react';

export default function HomeEaseHero() {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    {
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
      alt: 'Professional cleaner at work'
    },
    {
      url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80',
      alt: 'Plumber fixing pipes'
    },
    {
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80',
      alt: 'Electrician working'
    },
    {
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
      alt: 'AC repair technician'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative min-h-screen mt-5 overflow-hidden">
      {/* Full Background Image Slider */}
      <div className="absolute inset-0 w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevImage}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextImage}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentImage
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
                  Trusted by 50,000+ Homeowners
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg">
                Smart Home Services at Your{' '}
                <span className="text-red-500">Fingertips</span>
              </h1>
              
              <p className="text-xl text-gray-100 leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow-md">
                Find and book trusted professionals for all your home needs in just a few clicks. 
                Experience convenience, reliability, and peace of mind with every service.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
              <div className="flex items-center justify-center lg:justify-start space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-white font-medium">Verified Experts</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-white font-medium">Quick Booking</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                <Shield className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-white font-medium">100% Secure</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="group bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-1">
                Book a Service
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <button className="bg-white/90 backdrop-blur-sm text-red-600 border-2 border-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center lg:text-left bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="text-3xl font-bold text-red-400">500+</div>
                <div className="text-sm text-gray-200">Professionals</div>
              </div>
              <div className="text-center lg:text-left bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="text-3xl font-bold text-red-400">50k+</div>
                <div className="text-sm text-gray-200">Happy Clients</div>
              </div>
              <div className="text-center lg:text-left bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="text-3xl font-bold text-red-400">4.9★</div>
                <div className="text-sm text-gray-200">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Quick Links - Positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
            <h3 className="text-center text-gray-500 text-sm font-semibold uppercase tracking-wide mb-6">
              Popular Services
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {['Cleaning', 'Plumbing', 'Electrical', 'AC Repair', 'Painting', 'Carpentry'].map((service) => (
                <button
                  key={service}
                  className="bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 py-3 px-4 rounded-xl font-medium transition-all duration-300 border border-gray-200 hover:border-red-300 hover:shadow-md"
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delay-1 {
          animation: float 3s ease-in-out 1s infinite;
        }
        
        .animate-float-delay-2 {
          animation: float 3s ease-in-out 2s infinite;
        }
      `}</style>
    </div>
  );
}
