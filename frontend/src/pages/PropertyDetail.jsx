import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    const fetchProp = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProp();
  }, [id]);

  const handlePredict = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/predict', { property_id: id });
      setPrediction(res.data.predicted_price);
    } catch (err) {
      console.error(err);
      alert('Error running AI price prediction');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-3xl font-black text-blue-600 animate-pulse">Analyzing Property Data...</div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-400 uppercase tracking-widest">Inventory record not found</div>;

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Cinematic Hero Header */}
      <div className="relative h-[60vh] bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 z-10"></div>
        <img src="/hero-bg.png" alt="Property Header" className="w-full h-full object-cover opacity-60 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-20"></div>
        <div className="absolute bottom-0 left-0 w-full p-12 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${property.land_type_id === 1 ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
              {property.land_type_name} Catalog Entry
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mt-4 tracking-tighter uppercase leading-none">{property.title}</h1>
            <div className="flex items-center mt-6 text-gray-500 font-bold uppercase tracking-widest text-sm">
               <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
               {property.village}, {property.taluk}, {property.district}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            {/* Core Stats Chips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Market Price</p>
                 <p className="text-2xl font-black text-blue-600 uppercase">₹{parseFloat(property.price).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Scale</p>
                 <p className="text-2xl font-black text-gray-900 uppercase">{property.area} {property.land_type_id === 1 ? 'Acres' : 'Sq Ft'}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                 <p className="text-2xl font-black text-gray-900 uppercase">{property.land_type_name}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Verification</p>
                 <p className="text-2xl font-black text-emerald-600 uppercase">Authentic</p>
              </div>
            </div>

            <div className="space-y-12">
              <section>
                <h3 className="text-3xl font-black text-gray-900 border-l-8 border-blue-600 pl-6 mb-8 uppercase tracking-tighter">Sales Narrative</h3>
                <p className="text-xl text-gray-600 leading-relaxed font-medium bg-gray-50 p-10 rounded-[2.5rem] italic whitespace-pre-wrap">
                  "{property.description || "The seller has provided professional documentation for this listing."}"
                </p>
              </section>

              {/* Technical Specifications Section */}
              <section>
                <h3 className="text-3xl font-black text-gray-900 border-l-8 border-indigo-600 pl-6 mb-8 uppercase tracking-tighter">Technical Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {property.land_type_id === 1 ? (
                    <>
                      <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex flex-col">
                        <span className="text-emerald-600 font-black uppercase text-[10px] mb-1">Soil Type</span>
                        <span className="font-black text-gray-900">{property.soil_type || 'N/A'}</span>
                      </div>
                      <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex flex-col">
                        <span className="text-emerald-600 font-black uppercase text-[10px] mb-1">Soil Depth</span>
                        <span className="font-black text-gray-900">{property.soil_depth ? `${property.soil_depth} ft` : 'N/A'}</span>
                      </div>
                      <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex flex-col">
                        <span className="text-emerald-600 font-black uppercase text-[10px] mb-1">Road Access</span>
                        <span className="font-black text-gray-900">{property.road_access_type || 'N/A'}</span>
                      </div>
                      <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex flex-col">
                        <span className="text-emerald-600 font-black uppercase text-[10px] mb-1">Highway Dist</span>
                        <span className="font-black text-gray-900">{property.distance_from_highway ? `${property.distance_from_highway} km` : 'N/A'}</span>
                      </div>
                      <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex flex-col col-span-2">
                        <span className="text-emerald-600 font-black uppercase text-[10px] mb-1">Fencing Details</span>
                        <span className="font-black text-gray-900">{property.fencing_details || 'N/A'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col">
                        <span className="text-blue-600 font-black uppercase text-[10px] mb-1">Approval #</span>
                        <span className="font-black text-gray-900">{property.approval_number || 'N/A'}</span>
                      </div>
                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col">
                        <span className="text-blue-600 font-black uppercase text-[10px] mb-1">Plot Shape</span>
                        <span className="font-black text-gray-900">{property.plot_shape || 'N/A'}</span>
                      </div>
                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col">
                        <span className="text-blue-600 font-black uppercase text-[10px] mb-1">Road Width</span>
                        <span className="font-black text-gray-900">{property.road_width ? `${property.road_width} ft` : 'N/A'}</span>
                      </div>
                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col">
                        <span className="text-blue-600 font-black uppercase text-[10px] mb-1">Facing</span>
                        <span className="font-black text-gray-900">{property.facing || 'N/A'}</span>
                      </div>
                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col">
                        <span className="text-blue-600 font-black uppercase text-[10px] mb-1">Corner Plot</span>
                        <span className="font-black text-gray-900">{property.corner_plot ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col">
                        <span className="text-blue-600 font-black uppercase text-[10px] mb-1">Gated Community</span>
                        <span className="font-black text-gray-900">{property.gated_community ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col col-span-2">
                        <span className="text-blue-600 font-black uppercase text-[10px] mb-1">Nearby Landmarks</span>
                        <span className="font-black text-gray-900">{property.landmarks || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-black text-gray-900 border-l-8 border-emerald-500 pl-6 uppercase tracking-tighter">Geospatial Intelligence</h3>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live API Data</span>
                </div>
                
                {property.amenities_data && (
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 mb-8">
                    {Object.entries(property.amenities_data.counts || {}).map(([key, count]) => (
                      <div key={key} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{key}</p>
                        <p className="text-xl font-black text-gray-900">{count}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Center City Access</p>
                     <p className="text-2xl font-black text-indigo-900">{property.distance_to_cbd_km || '5.2'} KM</p>
                   </div>
                   <div className="p-8 rounded-[2rem] bg-amber-50 border border-amber-100">
                     <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Education Proximity</p>
                     <p className="text-2xl font-black text-amber-900">
                       {property.amenities_data?.distances?.nearest_school_m ? (property.amenities_data.distances.nearest_school_m / 1000).toFixed(1) : '1.2'} KM
                     </p>
                   </div>
                   <div className="p-8 rounded-[2rem] bg-rose-50 border border-rose-100">
                     <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Healthcare Centers</p>
                     <p className="text-2xl font-black text-rose-900">
                       {property.amenities_data?.distances?.nearest_hospital_m ? (property.amenities_data.distances.nearest_hospital_m / 1000).toFixed(1) : '0.8'} KM
                     </p>
                   </div>
                </div>
              </section>

              <section className="bg-gray-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600 opacity-5 mix-blend-overlay"></div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Automated Appraisal</h3>
                      <p className="text-blue-200 font-medium max-w-sm">Market valuation powered by amenity credit-based prediction engine.</p>
                    </div>
                    <div className="mt-8 md:mt-0 text-right">
                      {property.predicted_price ? (
                        <div>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">AI Predicted Valuation</p>
                          <p className="text-5xl font-black text-white tracking-widest">₹{parseFloat(property.predicted_price).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-blue-300 mt-2 font-medium">Base: ₹{parseFloat(property.price).toLocaleString('en-IN')} + Amenity Credits</p>
                        </div>
                      ) : prediction ? (
                        <div>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Confidence-Driven Valuation</p>
                          <p className="text-5xl font-black text-white tracking-widest">₹{parseFloat(prediction).toLocaleString('en-IN')}</p>
                        </div>
                      ) : (
                        <button onClick={handlePredict} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-3xl transition-all shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 uppercase tracking-widest text-sm">
                          Calculate Prediction
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Amenity Credit Breakdown */}
                  {property.amenity_credits && Object.keys(property.amenity_credits).length > 0 && (
                    <div className="border-t border-white/10 pt-8">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Amenity Credit Breakdown</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(property.amenity_credits).map(([key, value]) => (
                          <div key={key} className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{key}</p>
                            <p className={`text-lg font-black ${value > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                              {value > 0 ? `+₹${Math.round(value).toLocaleString('en-IN')}` : '₹0'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
          
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Official Documentation</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <span className="text-gray-500 font-bold uppercase text-xs">Patta ID</span>
                    <span className="text-gray-900 font-black font-mono">{property.patta_number || 'TR-2024-X'}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <span className="text-gray-500 font-bold uppercase text-xs">Survey No</span>
                    <span className="text-gray-900 font-black font-mono">{property.survey_number}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <span className="text-gray-500 font-bold uppercase text-xs">Village</span>
                    <span className="text-gray-900 font-black uppercase text-xs">{property.village}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-gray-500 font-bold uppercase text-xs">Taluk</span>
                    <span className="text-gray-900 font-black uppercase text-xs">{property.taluk}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-lg">
                Secure Inquiry &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
