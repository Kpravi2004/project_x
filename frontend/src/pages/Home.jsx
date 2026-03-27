import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="scroll-smooth">
      {/* Hero Section */}
      <div 
        className="relative h-screen flex items-center justify-center text-center bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
            Find Your Perfect Land in <span className="text-blue-400">South Tamil Nadu</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-2xl text-gray-100 drop-shadow-md font-medium">
            Smart property valuation using Geospatial AI and ML-driven price predictions.
          </p>
          <div className="mt-12 flex justify-center gap-6">
            <a href="#about" className="btn-secondary text-xl px-10 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform bg-white/20 text-white backdrop-blur-md border-white/30">
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-blue-400 font-bold uppercase tracking-widest text-sm">Our Mission</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4">
              Modernizing Real Estate in <span className="text-blue-400">Tamil Nadu</span>
            </h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-500/50 transition-colors">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622l-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Official Verification</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Every listing is cross-referenced with Patta and official records to ensure 100% legal ownership and transparency.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-500/50 transition-colors">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">ML Price Engine</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Our multivariate linear regression models calculate real-world market values based on proximity to infrastructure and amenities.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-500/50 transition-colors">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Geospatial Insights</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Automatic amenity extraction from coordinates provides detailed insights into nearby hospitals, schools, and transport hubs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
