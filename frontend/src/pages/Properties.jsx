import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Properties = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    land_type_id: '',
    district: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  useEffect(() => {
    fetchProps();
  }, [filters]);

  const fetchProps = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/properties?${queryParams}`);
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    if (!user) {
      if (window.confirm("You must login to use filters. Go to login page?")) {
        navigate('/signin');
      }
      return;
    }
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading && properties.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-black text-2xl animate-pulse">
      Loading Listings...
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header and Filter Bar */}
        <div className="bg-white rounded-[3rem] p-10 mb-12 shadow-sm border border-gray-100 relative overflow-hidden">
          {!user && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="bg-gray-900 border border-white/20 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center space-x-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <div className="text-left">
                  <p className="font-black uppercase tracking-widest text-[10px] text-blue-400">Restricted Access</p>
                  <p className="font-bold text-sm">Login to unlock powerful filtering tools.</p>
                </div>
                <Link to="/signin" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-blue-500/30">Login</Link>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="border-l-8 border-blue-600 pl-6">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Inventory</h2>
              <p className="text-gray-500 font-medium tracking-wide">Elite land listings across South Tamil Nadu.</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Search Anything</label>
                <input name="search" value={filters.search} onChange={handleFilterChange} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Title, Village..." />
              </div>
              <div className="w-40">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Land Type</label>
                <select name="land_type_id" value={filters.land_type_id} onChange={handleFilterChange} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold appearance-none cursor-pointer">
                  <option value="">All Types</option>
                  <option value="1">Agricultural</option>
                  <option value="2">Residential</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {properties.length === 0 ? (
            <div className="col-span-full py-24 bg-white rounded-[3rem] text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-2xl font-bold tracking-tight">No properties available in the catalog yet.</p>
              <Link to="/add-property" className="mt-6 inline-block text-blue-600 font-black hover:underline">Be the first to list &rarr;</Link>
            </div>
          ) : (
            properties.map(p => (
              <div key={p.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col border border-gray-100/50">
                <div className="h-64 bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <img src="/hero-bg.png" alt="Property" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700 opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  </div>
                  <div className="absolute top-6 left-6 z-20">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20 ${p.land_type_id === 1 ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                      {p.land_type_name}
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 z-20">
                    <p className="text-white text-3xl font-black drop-shadow-lg tracking-tighter">₹{parseFloat(p.price).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="p-10 flex-grow flex flex-col">
                  <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors duration-300 uppercase tracking-tighter leading-none mb-4 truncate">{p.title}</h3>
                  <div className="flex gap-4 mb-6">
                    <div className="flex items-center text-gray-400 text-xs font-black uppercase tracking-widest">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                      {p.district}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 italic mb-8 flex-grow">"{p.description || "The seller has listed this prime asset for review."}"</p>
                  
                  {user ? (
                    <Link to={`/properties/${p.id}`} className="w-full bg-gray-900 hover:bg-blue-600 text-white font-black py-4 rounded-2xl text-center transition-all shadow-lg hover:shadow-blue-600/30 active:scale-95 uppercase tracking-widest text-xs">
                      View Full Inventory Report &rarr;
                    </Link>
                  ) : (
                    <button onClick={() => navigate('/signin')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-center transition-all shadow-lg shadow-blue-500/30 active:scale-95 uppercase tracking-widest text-xs">
                      Login to See More Details &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;
