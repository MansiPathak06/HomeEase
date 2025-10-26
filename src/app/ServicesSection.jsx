"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Star, Wrench, Droplet, Zap, Wind, PaintBucket, Hammer } from 'lucide-react';

function ServicesSection() {
  const [visibleCards, setVisibleCards] = useState([]);
  const [visibleTestimonials, setVisibleTestimonials] = useState(false);
  const cardsRef = useRef([]);
  const testimonialsRef = useRef(null);

  const services = [
    {
      id: 1,
      icon: Wrench,
      title: 'Cleaning',
      description: 'Professional deep cleaning for spotless, hygienic spaces',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493625/cleaning_dro2fl.jpg'
    },
    {
      id: 2,
      icon: Droplet,
      title: 'Plumbing',
      description: 'Expert plumbing repairs and installations for your home',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493810/Plumbing_lnokuk.jpg'
    },
    {
      id: 3,
      icon: Zap,
      title: 'Electrical',
      description: 'Safe and reliable electrical services by certified experts',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493627/Electrical_l6gmd4.jpg'
    },
    {
      id: 4,
      icon: Wind,
      title: 'AC Repair',
      description: 'Fast AC repair and maintenance for optimal cooling',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493674/AC_Repair_pc979w.jpg'
    },
    {
      id: 5,
      icon: PaintBucket,
      title: 'Painting',
      description: 'Transform your space with premium painting services',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493687/Painting_cojmnd.jpg'
    },
    {
      id: 6,
      icon: Hammer,
      title: 'Carpentry',
      description: 'Custom woodwork and furniture crafted to perfection',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493627/Carpentry_k6uqoa.jpg'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      text: 'Absolutely fantastic service! The team was professional, punctual, and exceeded all my expectations.',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael Chen',
      text: 'Best home service experience ever. They transformed my living room beautifully!',
      rating: 5
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      text: 'Highly recommend! Quality work at fair prices with excellent customer care throughout.',
      rating: 5
    }
  ];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px'
    };

    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = cardsRef.current.indexOf(entry.target);
          if (index !== -1 && !visibleCards.includes(index)) {
            setTimeout(() => {
              setVisibleCards(prev => [...prev, index]);
            }, index * 100);
          }
        }
      });
    };

    const handleTestimonialsIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleTestimonials(true);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const testimonialsObserver = new IntersectionObserver(handleTestimonialsIntersect, observerOptions);

    cardsRef.current.forEach(card => {
      if (card) observer.observe(card);
    });

    if (testimonialsRef.current) {
      testimonialsObserver.observe(testimonialsRef.current);
    }

    return () => {
      observer.disconnect();
      testimonialsObserver.disconnect();
    };
  }, [visibleCards]);

  return (
    <div className="bg-white">
      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Our Top Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from a wide range of trusted home services tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                ref={el => {
                  if (el) cardsRef.current[index] = el;
                }}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-transparent hover:border-red-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group ${
                  visibleCards.includes(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: visibleCards.includes(index) ? '0ms' : `${index * 100}ms`
                }}
              >
                <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Icon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-red-600 p-3 rounded-full shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {service.description}
                  </p>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials & Stats Section */}
<section 
  ref={testimonialsRef}
  className="bg-gradient-to-br from-gray-50 via-red-50 to-gray-50 py-20 relative overflow-hidden"
>
  {/* Animated Background Elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-10 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div className="absolute top-0 right-10 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
  </div>

  <div className="max-w-7xl mx-auto px-6 relative z-10">
    {/* Section Header */}
    <div className={`text-center mb-16 transition-all duration-1000 ${
      visibleTestimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        What Our Customers Say
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Real experiences from real people who trust us with their homes
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Stats Section */}
      <div className={`transition-all duration-1000 ${
        visibleTestimonials ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
      }`}>
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            Trusted by Thousands
          </h3>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-red-100 text-sm">Happy Customers</div>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-red-100 text-sm">Services Completed</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-red-100 text-sm">Average Rating</div>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-red-100 text-sm">Satisfaction Rate</div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">100% Verified Reviews</div>
                <div className="text-sm text-gray-600">All feedback is authentic</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Secure & Safe Service</div>
                <div className="text-sm text-gray-600">Background-checked professionals</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Quick Response Time</div>
                <div className="text-sm text-gray-600">Average 2-hour response</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className={`transition-all duration-1000 delay-300 ${
        visibleTestimonials ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}>
        <div className="space-y-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-red-500 transform hover:-translate-y-1 group"
              style={{
                transitionDelay: visibleTestimonials ? `${(index + 1) * 200}ms` : '0ms'
              }}
            >
              {/* Profile Section */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-red-600 text-red-600"
                      />
                    ))}
                  </div>
                </div>
                <div className="text-red-600 opacity-20 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed italic">
                &quot;{testimonial.text}&quot;
              </p>

              {/* Bottom Badge */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Verified Customer</span>
                <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="mt-8 text-center">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 transform hover:scale-105">
            Read More Reviews
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

    </div>
  );
}

export default ServicesSection;
