import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProp, setSelectedProp] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [fetchedAmenities, setFetchedAmenities] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/pending-properties');
      setPending(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (prop) => {
    try {
      setSelectedProp(prop);
      setComparison(null);
      setFetchedAmenities(null);
      const res = await axios.get(`http://localhost:5000/api/admin/check-match/${prop.id}`);
      setComparison(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching comparison data');
    }
  };

  const handleVerify = async (id, approved) => {
    try {
      setVerifying(true);
      const res = await axios.post(`http://localhost:5000/api/admin/verify-property/${id}`, { approved });
      if (approved && res.data.prediction) {
        const p = res.data.prediction;
        alert(`✅ Property Approved!\n\nOriginal Price: ₹${Math.round(parseFloat(p.original_price)).toLocaleString()}\nAmenity Bonus: ₹${Math.round(p.amenity_bonus).toLocaleString()}\nPredicted Price: ₹${Math.round(p.predicted_price).toLocaleString()}\n\nBreakdown:\n${Object.entries(p.breakdown || {}).map(([k,v]) => `  ${k}: ₹${Math.round(v).toLocaleString()}`).join('\n')}`);
      } else if (approved) {
        alert('Property Approved');
      } else {
        alert('Property Rejected');
      }
      setSelectedProp(null);
      setComparison(null);
      setFetchedAmenities(null);
      fetchPending();
    } catch (err) {
      console.error(err);
      alert('Verification failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setVerifying(false);
    }
  };

  const handleRequestAmenities = async (id) => {
    // Determine missing categories from fetchedAmenities (or from property data)
    let missing = [];
    if (fetchedAmenities) {
      const am = fetchedAmenities;
      if (!am.distances?.nearest_bus_m) missing.push('bus_stop');
      if (!am.distances?.nearest_school_m) missing.push('school');
      if (!am.distances?.nearest_hospital_m) missing.push('hospital');
      if (!am.distances?.nearest_bank_m) missing.push('bank');
      if (!am.distances?.nearest_supermarket_m) missing.push('supermarket');
      if (!am.distances?.nearest_park_m) missing.push('park');
    }
    const note = prompt("Enter a brief note for the user", missing.length ? `Missing: ${missing.join(', ')}` : 'Please provide approximate distances to nearest amenities.');
    if (!note) return;

    try {
      await axios.post(`http://localhost:5000/api/admin/request-amenities/${id}`, { note, missingCategories: missing });
      alert('Request sent to user');
      setSelectedProp(null);
      setComparison(null);
      setFetchedAmenities(null);
      fetchPending();
    } catch (err) {
      console.error(err);
      alert('Failed to send request');
    }
  };

  const handleFetchAmenities = async (id) => {
    try {
      setVerifying(true);
      const res = await axios.post(`http://localhost:5000/api/admin/fetch-amenities/${id}`);
      alert('Amenities fetched and stored. You can now review them before approval.');
      setFetchedAmenities(res.data.amenities);
      // Refresh comparison to show updated property data (amenities_data is now stored)
      const comparisonRes = await axios.get(`http://localhost:5000/api/admin/check-match/${id}`);
      setComparison(comparisonRes.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching amenities: ' + (err.response?.data?.message || err.message));
    } finally {
      setVerifying(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-12 text-center text-2xl text-red-600 font-bold">Access Denied</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Verification Intelligence</h1>
          <Link to="/admin/properties" className="bg-white border border-gray-200 text-gray-600 font-bold py-3 px-8 rounded-full shadow-sm hover:bg-gray-50 transition-all active:scale-95 text-sm uppercase tracking-widest">
            Inventory Management &rarr;
          </Link>
        </div>

        {loading ? (
           <div className="flex justify-center p-20 font-black text-blue-600 animate-pulse">Syncing with Registry...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Pending List */}
            <div className={`space-y-6 ${selectedProp ? 'hidden lg:block' : 'col-span-3'}`}>
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Pending Review Queue ({pending.length})</h2>
              {pending.map(prop => (
                <div key={prop.id} onClick={() => handleReview(prop)} className={`bg-white p-6 rounded-[2rem] border transition-all cursor-pointer hover:shadow-xl ${selectedProp?.id === prop.id ? 'border-blue-500 ring-2 ring-blue-100 shadow-xl' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-gray-900">{prop.title}</h3>
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Pending</span>
                  </div>
                  <p className="text-sm text-gray-500 font-bold mb-4">{prop.village}, {prop.district}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-black text-sm">₹{prop.price.toLocaleString()}</span>
                    <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Review Details</button>
                  </div>
                </div>
              ))}
              {pending.length === 0 && <div className="p-20 text-center text-gray-400 font-bold">Queue is empty. Well done!</div>}
            </div>

            {/* Verification Detail / Comparison */}
            {selectedProp && (
              <div className="col-span-1 lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100">
                   <div className="flex justify-between items-start mb-10">
                      <div>
                         <h2 className="text-3xl font-black text-gray-900">Prop-ID: #{selectedProp.id}</h2>
                         <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Cross-Check with Official Patta Registry</p>
                      </div>
                      <button onClick={() => setSelectedProp(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                   </div>

                   {!comparison ? (
                      <div className="p-20 text-center font-black text-blue-600 animate-spin">Checking Registry...</div>
                   ) : (
                      <>
                        {comparison.match ? (
                           <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] mb-10 flex items-center space-x-6">
                              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">✓</div>
                              <div>
                                 <h4 className="text-emerald-900 font-black">Official Record Match Found</h4>
                                 <p className="text-emerald-700 text-sm font-medium">Automatic verification suggests this data is authentic.</p>
                              </div>
                           </div>
                        ) : (
                           <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] mb-10 flex items-center space-x-6">
                              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">!</div>
                              <div>
                                 <h4 className="text-red-900 font-black">No Registry Match</h4>
                                 <p className="text-red-700 text-sm font-medium">Survey number not found in the official Patta registry. Admin can still approve with manual amenities.</p>
                              </div>
                           </div>
                        )}

                        {/* Show coordinates if patta match found */}
                        {comparison.match && comparison.coordinates && (
                          <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] mb-10">
                            <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Official Coordinates (from Patta)</h5>
                            <div className="flex gap-8">
                              <div>
                                <span className="block text-[8px] font-black text-gray-400 uppercase">Latitude</span>
                                <span className="text-lg font-black text-blue-900 font-mono">{comparison.coordinates.latitude}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] font-black text-gray-400 uppercase">Longitude</span>
                                <span className="text-lg font-black text-blue-900 font-mono">{comparison.coordinates.longitude}</span>
                              </div>
                            </div>
                            <p className="text-xs text-blue-600 mt-3 font-medium">These coordinates will be used to fetch nearby amenities for price prediction.</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-10">
                           <div className="space-y-6">
                              <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">User Submitted Data</h5>
                              <div className="space-y-4">
                                 {['survey_number', 'village', 'taluk', 'district', 'area'].map(field => (
                                    <div key={field} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                       <span className="block text-[8px] font-black text-gray-400 uppercase mb-1">{field.replace('_', ' ')}</span>
                                       <span className="text-lg font-black text-gray-900">{selectedProp[field]}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-6">
                              <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Official Registry Data</h5>
                              <div className="space-y-4">
                                 {['survey_number', 'village', 'taluk', 'district', 'area'].map(field => {
                                    const match = comparison.match && String(comparison.patta[field]) === String(selectedProp[field]);
                                    return (
                                       <div key={field} className={`p-4 rounded-2xl border transition-all ${comparison.match ? (match ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100') : 'bg-gray-100 border-dashed opacity-50'}`}>
                                          <span className="block text-[8px] font-black text-gray-400 uppercase mb-1 text-right">{field.replace('_', ' ')}</span>
                                          <span className={`text-lg font-black block text-right ${comparison.match ? (match ? 'text-emerald-900' : 'text-red-900 font-black') : 'text-gray-400 text-sm italic'}`}>
                                             {comparison.match ? comparison.patta[field] : 'N/A'}
                                          </span>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                        </div>

                         {/* Display fetched amenities if any */}
                         {fetchedAmenities && (
                           <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                             <h4 className="text-lg font-black mb-2">Fetched Amenities (Geoapify)</h4>
                             <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <strong>Counts:</strong>
                                 <pre className="text-xs mt-1">{JSON.stringify(fetchedAmenities.counts, null, 2)}</pre>
                               </div>
                               <div>
                                 <strong>Distances (m):</strong>
                                 <pre className="text-xs mt-1">{JSON.stringify(fetchedAmenities.distances, null, 2)}</pre>
                               </div>
                             </div>
                           </div>
                         )}

                         <div className="mt-12 pt-10 border-t flex flex-wrap gap-4">
                            <button onClick={() => handleFetchAmenities(selectedProp.id)} disabled={verifying} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                               {verifying ? 'PROCESSING...' : 'GET AMENITIES'}
                            </button>
                            <button onClick={() => handleVerify(selectedProp.id, true)} disabled={verifying} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                               {verifying ? 'PROCESSING...' : 'CONFIRM & APPROVE'}
                            </button>
                            <button onClick={() => handleRequestAmenities(selectedProp.id)} disabled={verifying} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
                               REQUEST MANUAL DETAILS
                            </button>
                            <button onClick={() => handleVerify(selectedProp.id, false)} disabled={verifying} className="flex-1 bg-red-50 text-red-600 font-black py-4 rounded-2xl hover:bg-red-100 transition-all">
                               REJECT SUBMISSION
                            </button>
                         </div>
                      </>
                   )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;