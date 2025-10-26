"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Search, Calendar, CheckCircle, Shield, CreditCard, Headphones, Sparkles } from 'lucide-react';

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
      title: 'Browse Services',
      description: 'Explore categories like cleaning, plumbing, electrical, and more tailored to your needs.'
    },
    {
      id: 2,
      icon: Calendar,
      title: 'Book Instantly',
      description: 'Choose your expert and schedule at your convenience with just a few clicks.'
    },
    {
      id: 3,
      icon: CheckCircle,
      title: 'Relax & Enjoy',
      description: 'Sit back while verified professionals handle the job with care and expertise.'
    }
  ];

  const features = [
    {
      id: 1,
      icon: Shield,
      title: 'Verified Experts',
      description: 'All professionals are background-checked and certified for your peace of mind.'
    },
    {
      id: 2,
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Safe and encrypted payment options with transparent pricing and no hidden fees.'
    },
    {
      id: 3,
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support ready to assist you whenever you need help.'
    },
    {
      id: 4,
      icon: Sparkles,
      title: 'AI Recommendations',
      description: 'Smart suggestions based on your preferences and service history for personalized care.'
    }
  ];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px'
    };

    const handleStepsIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = stepsRef.current.indexOf(entry.target);
          if (index !== -1 && !visibleSteps.includes(index)) {
            setTimeout(() => {
              setVisibleSteps(prev => [...prev, index]);
            }, index * 200);
          }
        }
      });
    };

    const handleFeaturesIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = featuresRef.current.indexOf(entry.target);
          if (index !== -1 && !visibleFeatures.includes(index)) {
            setTimeout(() => {
              setVisibleFeatures(prev => [...prev, index]);
            }, index * 150);
          }
        }
      });
    };

    const handleCTAIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleCTA(true);
        }
      });
    };

    const stepsObserver = new IntersectionObserver(handleStepsIntersect, observerOptions);
    const featuresObserver = new IntersectionObserver(handleFeaturesIntersect, observerOptions);
    const ctaObserver = new IntersectionObserver(handleCTAIntersect, observerOptions);

    stepsRef.current.forEach(step => {
      if (step) stepsObserver.observe(step);
    });

    featuresRef.current.forEach(feature => {
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
          <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-red-200" 
               style={{ width: 'calc(100% - 120px)', left: '60px', zIndex: 0 }}>
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                ref={el => stepsRef.current[index] = el}
                className={`relative z-10 text-center transition-all duration-700 ${
                  visibleSteps.includes(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-12'
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

        {/* Why Choose Home Ease */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Home Ease
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our commitment to quality, security, and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  ref={el => featuresRef.current[index] = el}
                  className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-red-500 group ${
                    visibleFeatures.includes(index)
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'
                  }`}
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-red-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default HowItWorksSection;