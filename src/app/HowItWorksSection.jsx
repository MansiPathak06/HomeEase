"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Calendar,
  CheckCircle,
  Shield,
  Clock,
  ThumbsUp,
  Phone,
  ArrowRight,
  Award,
  CreditCard,
  Headphones,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const whyChooseFeatures = [
  {
    icon: Shield,
    title: "Verified Professionals",
    description:
      "All service providers are background-verified, trained, and highly experienced",
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536167/Verified_Professionals_eulr9u.jpg",
  },
  {
    icon: Clock,
    title: "On-Time Service",
    description:
      "We value your time with punctual service delivery and real-time tracking",
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536158/On-Time_Service_bpwvvx.jpg",
  },
  {
    icon: ThumbsUp,
    title: "Quality Guaranteed",
    description: "100% satisfaction guarantee with warranty on all services",
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536158/Quality_Guaranteed_t6bllk.jpg",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Round-the-clock customer support for emergencies and queries",
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536159/Support_iavewd.jpg",
  },
  {
    icon: ArrowRight,
    title: "Transparent Pricing",
    description:
      "Upfront quotes with no hidden charges for complete peace of mind",
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536159/Transparent_Pricing_qbpf3g.jpg",
  },
  {
    icon: Award,
    title: "Certified Experts",
    description:
      "Licensed technicians with years of experience in their respective fields",
    image:
      "https://res.cloudinary.com/dhwxbtiwt/image/upload/v1761536144/Certified_Experts_uwff84.jpg",
  },
];

const HowItWorksSection = () => {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const [visibleCTA, setVisibleCTA] = useState(false);

  const stepsRef = useRef([]);
  const featuresRef = useRef([]);
  const ctaRef = useRef(null);

  const steps = [
    {
      id: 1,
      icon: Search,
      title: "Browse Services",
      description:
        "Explore categories like cleaning, plumbing, electrical, and more tailored to your needs.",
    },
    {
      id: 2,
      icon: Calendar,
      title: "Book Instantly",
      description:
        "Choose your expert and schedule at your convenience with just a few clicks.",
    },
    {
      id: 3,
      icon: CheckCircle,
      title: "Relax & Enjoy",
      description:
        "Sit back while verified professionals handle the job with care and expertise.",
    },
  ];

  const features = [
    {
      id: 1,
      icon: Shield,
      title: "Verified Experts",
      description:
        "All professionals are background-checked and certified for your peace of mind.",
    },
    {
      id: 2,
      icon: CreditCard,
      title: "Secure Payments",
      description:
        "Safe and encrypted payment options with transparent pricing and no hidden fees.",
    },
    {
      id: 3,
      icon: Headphones,
      title: "24/7 Support",
      description:
        "Round-the-clock customer support ready to assist you whenever you need help.",
    },
    {
      id: 4,
      icon: Sparkles,
      title: "AI Recommendations",
      description:
        "Smart suggestions based on your preferences and service history for personalized care.",
    },
  ];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "0px",
    };

    const handleStepsIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = stepsRef.current.indexOf(entry.target);
          if (index !== -1 && !visibleSteps.includes(index)) {
            setTimeout(() => {
              setVisibleSteps((prev) => [...prev, index]);
            }, index * 200);
          }
        }
      });
    };

    const handleFeaturesIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = featuresRef.current.indexOf(entry.target);
          if (index !== -1 && !visibleFeatures.includes(index)) {
            setTimeout(() => {
              setVisibleFeatures((prev) => [...prev, index]);
            }, index * 150);
          }
        }
      });
    };

    const handleCTAIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleCTA(true);
        }
      });
    };

    const stepsObserver = new IntersectionObserver(
      handleStepsIntersect,
      observerOptions
    );
    const featuresObserver = new IntersectionObserver(
      handleFeaturesIntersect,
      observerOptions
    );
    const ctaObserver = new IntersectionObserver(
      handleCTAIntersect,
      observerOptions
    );

    stepsRef.current.forEach((step) => {
      if (step) stepsObserver.observe(step);
    });

    featuresRef.current.forEach((feature) => {
      if (feature) featuresObserver.observe(feature);
    });

    if (ctaRef.current) {
      ctaObserver.observe(ctaRef.current);
    }

    return () => {
      stepsObserver.disconnect();
      featuresObserver.disconnect();
      ctaObserver.disconnect();
    };
  }, []);

  return (
    <div className="bg-white">
      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How Home Ease Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple steps to book trusted professionals for your home services
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-20 relative">
          {/* Connection Lines (Desktop only) */}
          <div
            className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-red-200"
            style={{ width: "calc(100% - 120px)", left: "60px", zIndex: 0 }}
          ></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                ref={(el) => (stepsRef.current[index] = el)}
                className={`relative z-10 text-center transition-all duration-700 ${
                  visibleSteps.includes(index)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
              >
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300">
                      <Icon className="w-14 h-14 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-white border-4 border-red-600 rounded-full flex items-center justify-center font-bold text-red-600 text-lg">
                      {step.id}
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Why Choose Us - ENHANCED WITH IMAGES */}
        <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-red-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Why Choose Home Ease?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                We deliver excellence in every service with verified experts and
                guaranteed satisfaction
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {whyChooseFeatures.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-3 border border-gray-200 hover:border-red-500"
                  >
                    {/* Larger image height */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={benefit.image}
                        alt={benefit.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>

                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto -mt-12 mb-4 group-hover:scale-110 transition-transform shadow-xl relative z-10">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

export default HowItWorksSection;
