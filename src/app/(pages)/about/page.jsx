// about/page.jsx

import React from "react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center pt-24 px-4">
      <section
        className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 border-t-8 border-red-500 animate-fadeIn"
        style={{
          animation: "fadeIn 1.2s cubic-bezier(0.23, 1, 0.32, 1)"
        }}
      >
        <h1 className="text-4xl font-bold text-red-600 mb-4 text-center transition-all duration-500 hover:scale-105">
          Home Ease
        </h1>
        <h2 className="text-lg font-semibold text-red-500 mb-8 text-center tracking-wide">
          A Smart Platform for On-Demand Home Services
        </h2>
        <div className="text-gray-900 space-y-8">
          <div className="transition-all duration-700 bg-red-50 p-5 rounded-lg hover:shadow-lg">
            <h3 className="text-2xl font-bold text-red-600 mb-2">Key Features</h3>
            <ul className="list-disc pl-6 space-y-1 text-base text-gray-700">
              <li>Connects users instantly with trusted, skilled professionals for various household services.</li>
              <li>Verified worker profiles with ratings ensure reliability and user confidence.</li>
              <li>Instant booking and direct communication with service providers.</li>
              <li>User-friendly interface optimized for quick searches and seamless booking.</li>
              <li>Worker dashboard for profile management, availability, and job tracking.</li>
              <li>Secure and scalable platform architecture designed for large-scale use.</li>
              <li>Built with modern web technologies for speed and responsiveness.</li>
            </ul>
          </div>
          <div className="transition-all duration-700 bg-white border-l-4 border-red-400 p-5 rounded-lg hover:shadow-lg">
            <h3 className="text-2xl font-bold text-red-600 mb-2">Future Objectives</h3>
            <ul className="list-disc pl-6 space-y-1 text-base text-gray-700">
              <li>Integrate AI-powered recommendation system for personalized worker suggestions.</li>
              <li>Launch dedicated mobile apps for Android and iOS platforms.</li>
              <li>Add online payment gateway for convenient and secure transactions.</li>
              <li>Enable geo-location tracking for finding nearby services fast.</li>
              <li>Develop analytics dashboards for monitoring service quality and user satisfaction.</li>
              <li>Expand into new categories and cities to maximize impact.</li>
            </ul>
          </div>
          <div className="mt-8 rounded-lg bg-red-100 p-4 transition-opacity duration-700 opacity-90 hover:opacity-100 text-center">
            <h3 className="text-xl font-bold text-red-600 mb-2">Empowering Digital Transformation</h3>
            <p className="text-gray-800 text-sm leading-relaxed">
              HomeEase aims to modernize home service access, create job opportunities, and bring digital empowerment to households and workers alike.
            </p>
          </div>
          {/* <div className="mt-8 text-center text-gray-500 animate-fadeInUp">
            <span className="text-sm font-semibold tracking-wide">
              Made by Mansi Pathak, Shoaib Khan, Sachin Kumar, Vikas Pal<br />
              Guided by Dr. Atul Kumar Rai
            </span>
          </div> */}
        </div>
      </section>
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(40px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fadeIn {
            animation: fadeIn 1.2s cubic-bezier(0.23, 1, 0.32, 1);
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fadeInUp {
            animation: fadeInUp 1.5s 0.8s ease forwards;
          }
        `}
      </style>
    </main>
  );
}
