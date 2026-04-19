import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/properties?limit=3');
        setFeatured(res.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeatured();
  }, []);
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
            Find Your Perfect <span className="text-blue-400">Residential Land</span> in South TN
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

      {/* Featured Listings Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="border-l-8 border-blue-600 pl-6">
              <span className="text-blue-600 font-black uppercase tracking-widest text-xs">Market Pulse</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-901 mt-2 uppercase">
                Featured <span className="text-blue-600">Inventory</span>
              </h2>
            </div>
            <Link to="/properties" className="group flex items-center gap-3 text-gray-900 font-black uppercase tracking-widest text-sm hover:text-blue-600 transition-colors">
              View All 50+ Listings 
              <span className="bg-blue-600 text-white p-2 rounded-full group-hover:translate-x-2 transition-transform shadow-lg shadow-blue-500/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map(p => (
              <Link key={p.id} to={`/properties/${p.id}`} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col">
                <div className="h-64 relative overflow-hidden">
                  <img 
                    src={p.primary_image_url && !p.primary_image_url.includes('placeholder') ? `http://localhost:5000${p.primary_image_url}` : `https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800&sig=${p.id}`} 
                    alt={p.title} 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=800"; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 shadow-inner" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <p className="text-white text-2xl font-black">₹{parseFloat(p.price).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black text-gray-900 mb-2 truncate uppercase tracking-tighter">{p.title}</h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    {p.village}, {p.district}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
