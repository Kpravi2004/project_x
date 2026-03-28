import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Map technical keys to user‑friendly names and icons
const amenityKeys = [
  { key: 'schools', label: 'Schools', icon: '🏫', countCol: 'schools_1km_count', distCol: 'nearest_school_distance_m' },
  { key: 'hospitals', label: 'Hospitals', icon: '🏥', countCol: 'hospitals_2km_count', distCol: 'nearest_hospital_distance_m' },
  { key: 'bus_stops', label: 'Bus Stops', icon: '🚌', countCol: 'bus_stops_1km_count', distCol: 'nearest_bus_stop_distance_m' },
  { key: 'supermarkets', label: 'Supermarkets', icon: '🛒', countCol: 'supermarkets_1km_count', distCol: 'nearest_supermarket_distance_m' },
  { key: 'parks', label: 'Parks', icon: '🌳', countCol: 'parks_1km_count', distCol: 'nearest_park_distance_m' },
  { key: 'banks', label: 'Banks', icon: '🏦', countCol: 'banks_1km_count', distCol: 'nearest_bank_distance_m' }
];

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [futurePrediction, setFuturePrediction] = useState(null);

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
  }, [id, user, navigate]);

  const handleFuturePredict = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/predict', {
        property_id: id,
        target_year: targetYear
      });
      setFuturePrediction(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching future prediction');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-3xl font-black text-blue-600 animate-pulse">Loading property details...</div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-400 uppercase tracking-widest">Property not found</div>;

  const canViewFull = property.is_owner || property.is_admin;
  const credits = property.amenity_credits || {};

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Hero Header */}
      <div className="relative h-[60vh] bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 z-10"></div>
        <img src="/hero-bg.png" alt="Property Header" className="w-full h-full object-cover opacity-60 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-20"></div>
        <div className="absolute bottom-0 left-0 w-full p-12 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${property.land_type_id === 1 ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
              {property.land_type_name}
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
            {/* Core Stats */}
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

            {/* Media Gallery */}
            {property.media && property.media.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-4">Visual Assets</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.media.map(m => (
                    <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden">
                      {m.type === 'video' ? (
                        <video src={m.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.url} alt="Property" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-12">
              {/* Sales Narrative */}
              <section>
                <h3 className="text-3xl font-black text-gray-900 border-l-8 border-blue-600 pl-6 mb-8 uppercase tracking-tighter">Sales Narrative</h3>
                <p className="text-xl text-gray-600 leading-relaxed font-medium bg-gray-50 p-10 rounded-[2.5rem] italic whitespace-pre-wrap">
                  "{property.description || "The seller has provided professional documentation for this listing."}"
                </p>
              </section>

              {/* Technical Specifications */}
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

              {/* Geospatial Intelligence – Professional Table */}
              <section>
                <h3 className="text-3xl font-black text-gray-900 border-l-8 border-emerald-500 pl-6 mb-8 uppercase tracking-tighter">Nearby Amenities</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-xl">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Amenity</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Count (within 1‑2km)</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Nearest Distance</th>
                        <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Credit Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {amenityKeys.map(({ key, label, icon, countCol, distCol }) => {
                        const count = property[countCol];
                        const distance = property[distCol];
                        // Only show if at least one of count or distance is not null
                        if (count === undefined && distance === undefined) return null;
                        const credit = credits[key] || 0;
                        return (
                          <tr key={key} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-xl mr-2">{icon}</span>
                                <span className="font-bold text-gray-900">{label}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{count !== undefined ? count : '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {distance ? `${Math.round(distance)} m` : 'Not available'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {credit > 0 ? (
                                <span className="text-emerald-600 font-black">+₹{Math.round(credit).toLocaleString()}</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Price Prediction & Credits */}
              <section className="bg-gray-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600 opacity-5 mix-blend-overlay"></div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Price Prediction</h3>
                      <p className="text-blue-200 font-medium max-w-sm">Market valuation powered by amenity credit-based prediction engine.</p>
                    </div>
                    <div className="mt-8 md:mt-0 text-right">
                      {property.predicted_price ? (
                        <div>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Market Valuation</p>
                          <p className="text-5xl font-black text-white tracking-widest">₹{parseFloat(property.predicted_price).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-blue-300 mt-2 font-medium">Base: ₹{parseFloat(property.price).toLocaleString('en-IN')} + Amenity Credits</p>
                        </div>
                      ) : (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-3xl transition-all shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 uppercase tracking-widest text-sm">
                          Calculate Prediction
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Amenity Credit Breakdown */}
                  {Object.keys(credits).length > 0 && (
                    <div className="border-t border-white/10 pt-8">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Amenity Credit Breakdown</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(credits).map(([key, value]) => (
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

              {/* Future Prediction Section – Non‑linear (compound growth) */}
              <section className="bg-white border-2 border-gray-100 p-8 rounded-[3rem] shadow-sm">
                <h3 className="text-2xl font-black text-gray-900 mb-4">Predict Future Value</h3>
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Year</label>
                    <input
                      type="number"
                      min={new Date().getFullYear()}
                      max={2050}
                      value={targetYear}
                      onChange={(e) => setTargetYear(parseInt(e.target.value))}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <button
                    onClick={handleFuturePredict}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
                  >
                    Predict for {targetYear}
                  </button>
                </div>
                {futurePrediction && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <p className="text-sm text-gray-600 font-medium">Estimated price in <span className="font-black text-blue-800">{futurePrediction.target_year}</span>:</p>
                    <p className="text-3xl font-black text-blue-700 mt-2">
                      ₹{futurePrediction.predicted_price?.toLocaleString('en-IN')}
                    </p>
                    {futurePrediction.annual_growth_rate && (
                      <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
                        Based on annual growth rate of {(futurePrediction.annual_growth_rate * 100).toFixed(1)}%
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2 italic">
                      * Future growth is non‑linear (compound). New amenities added later will adjust the prediction.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {canViewFull ? (
                <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Official Documentation</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                      <span className="text-gray-500 font-bold uppercase text-xs">Patta ID</span>
                      <span className="text-gray-900 font-black font-mono">{property.patta_number || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                      <span className="text-gray-500 font-bold uppercase text-xs">Survey No</span>
                      <span className="text-gray-900 font-black font-mono">{property.survey_number || 'Not Available'}</span>
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
              ) : (
                <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 text-center">
                  <p className="text-gray-500 text-sm">Official details are private to the owner. For any inquiries, please use the button below.</p>
                </div>
              )}

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