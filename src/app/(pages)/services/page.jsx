"use client";
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  Droplet, 
  Zap, 
  Wind, 
  PaintBucket, 
  Hammer,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  ThumbsUp,
  Users,
  Home,
  Leaf,
  Bug,
  Tv,
  Drill,
  Truck,
  Settings,
  Star,
  Award,
  Lightbulb,
  Sofa,
  Lock,
  Camera,
  Waves,
  TreePine,
  Package,
  Scissors,
  Flame,
  ShowerHead,
  DoorOpen,
  Fence,
  Refrigerator,
  WashingMachine,
  Microwave
} from 'lucide-react';

function OurServicesPage() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Comprehensive Home Services
  const featuredServices = [
    {
      id: 1,
      icon: Droplet,
      title: 'Plumbing Services',
      description: 'Expert plumbing repairs, installations, and emergency fixes for all water-related issues',
      features: ['Pipe Repair & Installation', 'Leak Detection & Fix', 'Drain Cleaning', 'Water Heater Service', 'Faucet Replacement', 'Toilet Repair'],
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493810/Plumbing_lnokuk.jpg',
      bgGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      id: 2,
      icon: Zap,
      title: 'Electrical Services',
      description: 'Safe and reliable electrical services by certified and licensed professionals',
      features: ['Wiring & Rewiring', 'Switch & Outlet Installation', 'Circuit Breaker Repair', 'LED Setup', 'Panel Upgrade', 'Emergency Fixes'],
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493627/Electrical_l6gmd4.jpg',
      bgGradient: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      id: 3,
      icon: Sparkles,
      title: 'House Cleaning',
      description: 'Professional deep cleaning services for spotless, hygienic, and sanitized spaces',
      features: ['Deep Cleaning', 'Kitchen Sanitization', 'Bathroom Cleaning', 'Floor Polishing', 'Carpet Cleaning', 'Move-in/out Clean'],
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493625/cleaning_dro2fl.jpg',
      bgGradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      id: 4,
      icon: Wind,
      title: 'AC Service & Repair',
      description: 'Fast AC repair, maintenance, and installation for optimal cooling and air quality',
      features: ['AC Repair', 'Gas Filling & Refill', 'Deep Cleaning', 'Installation Service', 'Filter Replacement', 'Annual Maintenance'],
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493674/AC_Repair_pc979w.jpg',
      bgGradient: 'from-sky-500/20 to-blue-500/20'
    },
    {
      id: 5,
      icon: PaintBucket,
      title: 'Painting Services',
      description: 'Transform your space with premium painting and finishing services',
      features: ['Interior Painting', 'Exterior Painting', 'Wall Texture Design', 'Waterproofing', 'Wood Polish', 'Wallpaper Installation'],
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761493687/Painting_cojmnd.jpg',
      bgGradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      id: 6,
      icon: Wrench,
      title: 'Appliance Repair',
      description: 'Quick and reliable fixes for all your home appliances and electronic devices',
      features: ['Washing Machine', 'Refrigerator Repair', 'Microwave Service', 'Dishwasher Fix', 'Oven Repair', 'Chimney Service'],
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761499268/Appliance_Repair_ybs8nw.jpg',
      bgGradient: 'from-red-500/20 to-orange-500/20'
    }
  ];

  const additionalServices = [
    {
      id: 7,
      icon: Hammer,
      title: 'Carpentry Work',
      description: 'Custom woodwork, furniture repair, and carpentry crafted to perfection',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536143/Carpentry_Work_rvo7n7.jpg',
      details: ['Furniture Making', 'Door Installation', 'Cabinet Work', 'Wood Repairs']
    },
    {
      id: 8,
      icon: Home,
      title: 'Home Renovation',
      description: 'Complete home makeover, remodeling, and interior design services',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Home_Renovation_w7qwi8.jpg',
      details: ['Kitchen Remodel', 'Bathroom Upgrade', 'Room Renovation', 'Floor Design']
    },
    {
      id: 9,
      icon: Leaf,
      title: 'Gardening & Landscaping',
      description: 'Beautiful garden design, lawn care, and professional landscaping',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Gardening_Landscaping_hj5qae.jpg',
      details: ['Lawn Mowing', 'Plant Care', 'Garden Design', 'Tree Trimming']
    },
    {
      id: 10,
      icon: Bug,
      title: 'Pest Control',
      description: 'Safe and effective pest elimination and prevention services',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536159/Pest_Control_effbvx.jpg',
      details: ['Termite Control', 'Rodent Removal', 'Insect Treatment', 'Sanitization']
    },
    {
      id: 11,
      icon: Tv,
      title: 'TV & Electronics Setup',
      description: 'Installation and repair of home entertainment and electronic systems',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/TV_Electronics_Setup_qlbsig.jpg',
      details: ['TV Wall Mounting', 'Home Theater', 'Cable Management', 'Speaker Setup']
    },
    {
      id: 12,
      icon: Drill,
      title: 'Furniture Assembly',
      description: 'Professional furniture assembly, installation, and setup services',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Furniture_Assembly_frfjwc.jpg',
      details: ['IKEA Assembly', 'Bed Setup', 'Wardrobe Install', 'Shelf Mounting']
    },
    {
      id: 13,
      icon: Truck,
      title: 'Moving & Shifting',
      description: 'Safe and efficient home and office relocation services',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536148/Moving_Shifting_dqu5gl.jpg',
      details: ['Home Moving', 'Office Shifting', 'Packing Service', 'Vehicle Transport']
    },
    {
      id: 14,
      icon: Settings,
      title: 'Smart Home Setup',
      description: 'IoT device installation and complete home automation solutions',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/Smart_Home_Setup_gaqkdq.jpg',
      details: ['Smart Lights', 'Voice Control', 'Security Systems', 'Automation']
    },
    {
      id: 15,
      icon: DoorOpen,
      title: 'Door & Window Services',
      description: 'Installation, repair, and replacement of doors and windows',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Door_Window_Services_ipjyf2.jpg',
      details: ['Door Repair', 'Window Installation', 'Screen Replacement', 'Lock Fixing']
    },
    {
      id: 16,
      icon: Flame,
      title: 'Geyser & Water Heater',
      description: 'Installation, repair, and maintenance of water heating systems',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Geyser_Water_Heater_uxgxsb.jpg',
      details: ['Geyser Installation', 'Thermostat Repair', 'Element Replacement', 'Service']
    },
    {
      id: 17,
      icon: Fence,
      title: 'Fencing & Gate Work',
      description: 'Professional fence installation, repair, and gate automation',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Fencing_Gate_Work_koexy7.jpg',
      details: ['Fence Installation', 'Gate Repair', 'Automation', 'Boundary Wall']
    },
    {
      id: 18,
      icon: Lock,
      title: 'Locksmith Services',
      description: 'Emergency lockout assistance and security lock installation',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Locksmith_Service_drgetb.jpg',
      details: ['Lock Repair', 'Key Duplication', 'Emergency Unlock', 'Security Upgrade']
    },
    {
      id: 19,
      icon: Camera,
      title: 'CCTV & Security',
      description: 'Complete security camera installation and surveillance systems',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/CCTV_Security_abtcdk.jpg',
      details: ['CCTV Installation', 'DVR Setup', 'Remote Monitoring', 'Maintenance']
    },
    {
      id: 20,
      icon: Waves,
      title: 'Water Purifier Service',
      description: 'RO, UV, and water purifier installation and maintenance',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536167/Water_Purifier_Service_yktevb.jpg',
      details: ['RO Installation', 'Filter Change', 'AMC Service', 'Water Testing']
    },
    {
      id: 21,
      icon: TreePine,
      title: 'Tree Service & Care',
      description: 'Tree trimming, removal, and professional arborist services',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536160/Tree_Service_Care_avpshd.jpg',
      details: ['Tree Trimming', 'Removal Service', 'Stump Grinding', 'Plant Care']
    },
    {
      id: 22,
      icon: Package,
      title: 'Handyman Services',
      description: 'All-in-one handyman for minor repairs and general maintenance',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Handyman_Services_ahcjtn.jpg',
      details: ['Minor Repairs', 'Fixture Install', 'Drywall Patch', 'General Fixes']
    },
    {
      id: 23,
      icon: Sofa,
      title: 'Upholstery Cleaning',
      description: 'Deep cleaning and restoration of furniture upholstery',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536166/Upholstery_Cleaning_aeodvk.jpg',
      details: ['Sofa Cleaning', 'Mattress Cleaning', 'Carpet Wash', 'Stain Removal']
    },
    {
      id: 24,
      icon: Lightbulb,
      title: 'Lighting Solutions',
      description: 'Modern lighting design, installation, and smart lighting setup',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536145/Lighting_Solutions_ey6zwl.jpg',
      details: ['LED Installation', 'Chandelier Setup', 'Smart Lights', 'Outdoor Lighting']
    }
  ];

  const stats = [
    { icon: Users, number: '15,000+', label: 'Happy Customers' },
    { icon: CheckCircle2, number: '75,000+', label: 'Services Completed' },
    { icon: Award, number: '800+', label: 'Expert Professionals' },
    { icon: Star, number: '4.9/5', label: 'Average Rating' }
  ];

  

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative py-40 px-6 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536158/Professional_Home_Services_Background_yzqgrf.jpg"
            alt="Professional Home Services Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/95 to-red-700/90"></div>
        </div>

        {/* Content - CENTERED */}
        <motion.div 
          className="relative z-10 max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight text-center">
              Our Home Services
            </h1>
            <p className="text-2xl md:text-3xl text-white/95 max-w-4xl mx-auto leading-relaxed mb-6 text-center">
              Reliable professionals for every household need — anytime, anywhere
            </p>
            <p className="text-lg md:text-xl text-white/85 max-w-3xl mx-auto mb-12 text-center">
              From plumbing to painting, electrical to cleaning — we've got all your home service needs covered with verified experts
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-red-600 hover:bg-red-50 font-bold py-5 px-12 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 group text-lg">
                Book Service Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 font-bold py-5 px-12 rounded-xl transition-all duration-300 text-lg">
                View All Services
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white relative -mt-20 z-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-gray-100 hover:border-red-500 transition-all duration-300 text-center group hover:-translate-y-2"
                >
                  <Icon className="w-14 h-14 text-red-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-semibold text-lg">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Services Grid */}
      <section ref={sectionRef} className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Popular Services
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Explore our most requested home services with verified professionals and guaranteed quality
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {featuredServices.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  className="group bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-gray-100 hover:border-red-500 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl"
                >
                  {/* Service Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute top-5 right-5 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-5 leading-relaxed text-base">
                      {service.description}
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Button */}
                    <button className="w-full group/btn inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg">
                      View Service
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Additional Services - EXPANDED GRID */}
<section className="py-24 px-6 bg-white">
  <div className="max-w-7xl mx-auto">
    <motion.div 
      className="text-center mb-20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        Complete Home Solutions
      </h2>
      <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
        Professional services for every corner of your home — all under one roof
      </p>
    </motion.div>

    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.1 }}
    >
      {additionalServices.map((service, index) => {
        const Icon = service.icon;
        return (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl border border-gray-200 hover:border-red-500 transition-all duration-300 hover:-translate-y-2"
          >
            {/* Increased image height */}
            <div className="relative h-64 overflow-hidden">
              <img 
                src={service.image} 
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent"></div>
            </div>

            <div className="p-5">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center -mt-10 mb-3 shadow-xl relative z-10 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                {service.description}
              </p>
              
              {/* Service Details */}
              <div className="space-y-1 mb-4">
                {service.details && service.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <button className="text-red-600 hover:text-red-700 font-semibold text-xs flex items-center gap-1 group/link">
                Learn More
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  </div>
</section>



      {/* Service Process Section - NEW */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-gray-600">
              Simple 4-step process to get your service done
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
  {[
    {
      step: '01',
      icon: Phone,
      title: 'Book Service',
      description: 'Choose your service and schedule a convenient time',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563226/Book_Service_hwrt4t.jpg'
    },
    {
      step: '02',
      icon: Users,
      title: 'Get Matched',
      description: 'We assign the best verified professional for your needs',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563225/Get_Matched_ua93zw.jpg'
    },
    {
      step: '03',
      icon: Wrench,
      title: 'Service Done',
      description: 'Expert arrives on time and completes the work',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563231/Service_Done_wf7afl.jpg'
    },
    {
      step: '04',
      icon: Star,
      title: 'Rate & Review',
      description: 'Share your experience and enjoy quality service',
      image: 'https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761563229/Rate_Review_dicdgy.jpg'
    }
  ].map((process, index) => {
    const Icon = process.icon;
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 }}
        className="relative group"
      >
        {/* Step Image (Bigger now) */}
        <div className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-xl">
          <img
            src={process.image}
            alt={process.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 to-transparent"></div>

          {/* Step Number */}
          <div className="absolute top-5 left-5 text-7xl font-extrabold text-white/25">
            {process.step}
          </div>
        </div>

        {/* Content (Smaller Text) */}
        <div className="text-center">
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {process.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {process.description}
          </p>
        </div>

        {/* Connector Line (except last item) */}
        {index < 3 && (
          <div className="hidden lg:block absolute top-28 left-full w-full h-1 border-t-2 border-dashed border-gray-300 -translate-x-1/2"></div>
        )}
      </motion.div>
    );
  })}
</div>

        </div>
      </section>

      

      {/* CTA Section */}
      <motion.section 
        className="bg-gradient-to-r from-red-600 to-red-700 py-24 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white/20">
                <img 
                  src="https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761538862/Team_imw68d.jpg" 
                  alt="Professional Worker" 
                  className="w-full h-[550px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 to-transparent"></div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-8 shadow-2xl">
                <div className="text-center">
                  <div className="text-5xl font-bold text-red-600 mb-2">24/7</div>
                  <div className="text-base text-gray-600 font-semibold">Available</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white"
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                Having a problem?<br />
                We'll fix it today!
              </h2>
              
              <p className="text-red-100 text-xl mb-10 leading-relaxed">
                Get instant access to verified professionals ready to solve your home service needs. Quick response, quality work, guaranteed satisfaction.
              </p>

              <div className="space-y-5 mb-10">
                {[
                  'Verified & Experienced Professionals',
                  'Same-Day Service Available',
                  '100% Satisfaction Guaranteed',
                  'Transparent Pricing with No Hidden Charges',
                  'Emergency Services Available 24/7',
                  'Comprehensive Warranty on All Services'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <CheckCircle2 className="w-7 h-7 text-white flex-shrink-0" />
                    <span className="text-white font-medium text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-7 mb-10 border border-white/30">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <div className="text-red-100 text-base mb-1">Call Us Now</div>
                    <a href="tel:+912342312323" className="text-3xl font-bold hover:text-red-100 transition-colors">
                      📞 (234) 231 - 2323
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <button className="bg-white text-red-600 hover:bg-red-50 font-bold py-5 px-10 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 group text-lg">
                  Book Now
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 font-bold py-5 px-10 rounded-xl transition-all duration-300 text-lg">
                  Learn More
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

     
    </div>
  );
}

export default OurServicesPage;
