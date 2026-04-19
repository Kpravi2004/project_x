import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminPropertyList = () => {
  const { user } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    land_type_id: '',
    status: '',
    search: ''
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewProperty, setViewProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/admin/properties?${queryParams}`);
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this property?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/properties/${id}`);
      setProperties(properties.filter(p => p.id !== id));
    } catch (err) {
      alert('Error deleting property');
      console.error(err);
    }
  };

  const openEditModal = (property) => {
    setSelectedProperty(property);
    setEditForm({ ...property });
    setModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/admin/properties/${selectedProperty.id}`, editForm);
      alert('Property updated successfully');
      setModalOpen(false);
      fetchProperties();
    } catch (err) {
      alert('Error updating property');
      console.error(err);
    }
  };

  const openViewModal = async (property) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/properties/${property.id}`);
      setViewProperty(res.data);
      setViewModalOpen(true);
    } catch (err) {
      alert('Error loading property details');
      console.error(err);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-12 text-center text-2xl text-red-600 font-bold">Access Denied</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 gap-6">
          <div>
             <h1 className="text-3xl font-extrabold text-gray-900">Inventory Management</h1>
             <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest">Total Active Records: {properties.length}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <input name="search" value={filters.search} onChange={handleFilterChange} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold focus:ring-2 focus:ring-blue-500" placeholder="Search Title, Patta..." />
             <select name="land_type_id" value={filters.land_type_id} onChange={handleFilterChange} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold cursor-pointer">
               <option value="">All Types</option>
               <option value="1">Agricultural</option>
               <option value="2">Residential</option>
             </select>
             <select name="status" value={filters.status} onChange={handleFilterChange} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold cursor-pointer">
               <option value="">All Status</option>
               <option value="approved">Approved</option>
               <option value="pending">Pending</option>
               <option value="rejected">Rejected</option>
             </select>
             <Link to="/admin" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-full shadow transition-all active:scale-95 text-xs">
               &larr; Review Queue
             </Link>
             <Link to="/add-property" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 text-xs">
               Upload Form
             </Link>
          </div>
        </div>
        
        {loading && properties.length === 0 ? (
           <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="bg-white shadow overflow-x-auto rounded-[2rem] border border-gray-100 p-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 uppercase text-[10px] font-black tracking-widest text-gray-500">
                  <tr>
                    <th className="px-6 py-4 text-left">ID & Title</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Price (₹)</th>
                    <th className="px-6 py-4 text-left">Area</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <div className="flex flex-col">
                        <span className="text-xs text-blue-500">#{p.id}</span>
                        <span className="truncate max-w-xs">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-black uppercase tracking-widest">
                       {p.land_type_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 font-bold">
                       ₹{parseFloat(p.price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-bold">
                       {p.area} {p.land_type_id === 1 ? 'Ac' : 'SqFt'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-black uppercase tracking-widest rounded-full ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : p.status === 'pending' ? 'bg-amber-100 text-amber-800' : p.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openViewModal(p)} className="text-indigo-600 hover:text-indigo-900 mx-1 font-black uppercase text-[10px] tracking-widest">View</button>
                      <button onClick={() => openEditModal(p)} className="text-blue-600 hover:text-blue-900 mx-1 font-black uppercase text-[10px] tracking-widest">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 font-black uppercase text-[10px] tracking-widest">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {properties.length === 0 && (
              <div className="py-12 text-center text-gray-400 font-bold">No properties found in system.</div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {modalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Modify Asset #{selectedProperty.id}</h2>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Management Mode</p>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full transition-all"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={saveEdit} className="space-y-10">
              {/* Profile Context */}
              <section>
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span> Profile Context
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Asset Title</label>
                    <input name="title" value={editForm.title || ''} onChange={handleEditChange} className="bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" placeholder="E.g. 5 Cent Residential Plot" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Valuation (₹)</label>
                    <input type="number" name="price" value={editForm.price || ''} onChange={handleEditChange} className="bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-mono" placeholder="0.00" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Scale (SqFt/Ac)</label>
                    <input type="number" step="0.01" name="area" value={editForm.area || ''} onChange={handleEditChange} className="bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" placeholder="0.00" />
                  </div>
                </div>
              </section>

              {/* Geographical Mapping */}
              <section>
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Geographical Mapping
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">District</label>
                    <input name="district" value={editForm.district || ''} onChange={handleEditChange} className="bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Taluk / Region</label>
                    <input name="taluk" value={editForm.taluk || ''} onChange={handleEditChange} className="bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Village</label>
                    <input name="village" value={editForm.village || ''} onChange={handleEditChange} className="bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Survey Identifier</label>
                    <input name="survey_number" value={editForm.survey_number || ''} onChange={handleEditChange} className="bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner font-mono" />
                  </div>
                </div>
              </section>

              {/* Documentary Verification */}
              <section>
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span> Documentary Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Patta Resource (URL)</label>
                    <input name="patta_document_url" value={editForm.patta_document_url || ''} onChange={handleEditChange} className="bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner text-xs" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">FMB Sketch Resource (URL)</label>
                    <input name="fmb_sketch_url" value={editForm.fmb_sketch_url || ''} onChange={handleEditChange} className="bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner text-xs" />
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-4 pt-6 mt-10 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-8 py-4 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/30 active:scale-95 uppercase tracking-widest text-xs">Commit Updates</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && viewProperty && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-0 max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100">
            {/* Header Area */}
            <div className="p-8 pb-4 border-b border-gray-100 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{viewProperty.land_type_name}</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest rounded-full">{viewProperty.status}</span>
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none uppercase">{viewProperty.title}</h2>
                  <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    {viewProperty.village}, {viewProperty.taluk}, {viewProperty.district}
                  </p>
               </div>
               <button onClick={() => setViewModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
               {/* Valuation Intelligence */}
               <section className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Base Appraisal</p>
                      <p className="text-4xl font-black font-mono">₹{parseFloat(viewProperty.price).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-2">Amenity Credits (Capped)</p>
                      <p className="text-4xl font-black text-emerald-400 font-mono">
                        {viewProperty.amenity_credits ? `+₹${Math.round(Object.values(viewProperty.amenity_credits).reduce((a, b) => a + b, 0)).toLocaleString()}` : '₹0'}
                      </p>
                    </div>
                    <div className="md:border-l border-gray-700 md:pl-10">
                      <p className="text-[10px] font-black text-amber-300 uppercase tracking-widest mb-2">Fair Market Prediction</p>
                      <p className="text-4xl font-black text-blue-400 font-mono">₹{viewProperty.predicted_price ? parseFloat(viewProperty.predicted_price).toLocaleString('en-IN') : 'N/A'}</p>
                    </div>
                  </div>
               </section>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Land Metrics */}
                  <section>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <span className="w-2 h-2 bg-blue-600 rounded-full"></span> Land Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Scale</p>
                        <p className="text-xl font-black text-gray-900">{viewProperty.area} {viewProperty.land_type_id === 1 ? 'Acres' : 'Sq Ft'}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Identifier</p>
                        <p className="text-xl font-black text-gray-900 font-mono text-sm">{viewProperty.survey_number}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Patta Reference</p>
                        <p className="text-xl font-black text-gray-900 font-mono text-sm">{viewProperty.patta_number || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Owner Context</p>
                        <p className="text-xl font-black text-gray-900 truncate text-sm">{viewProperty.owner_name}</p>
                      </div>
                    </div>
                  </section>

                  {/* Technical Profile */}
                  <section>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Technical Profile
                    </h3>
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-4">
                       {viewProperty.land_type_id === 1 ? (
                         <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Soil Type</span><span className="font-bold">{viewProperty.soil_type || 'N/A'}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Water Table</span><span className="font-bold">{viewProperty.water_availability ? 'Sufficient' : 'None'}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Irrigation</span><span className="font-bold">{viewProperty.irrigation_type || 'N/A'}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Highway Dist.</span><span className="font-bold">{viewProperty.distance_from_highway ? `${viewProperty.distance_from_highway} km` : 'N/A'}</span></div>
                         </div>
                       ) : (
                         <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plot Geometry</span><span className="font-bold">{viewProperty.plot_shape || 'N/A'}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Infrastr. Road</span><span className="font-bold">{viewProperty.road_width ? `${viewProperty.road_width} ft` : 'N/A'}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vastu Facing</span><span className="font-bold">{viewProperty.facing || 'N/A'}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gated Security</span><span className="font-bold">{viewProperty.gated_community ? 'Yes' : 'No'}</span></div>
                         </div>
                       )}
                    </div>
                  </section>
               </div>

               {/* Spatial Analytics (Credits) */}
               <section>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <span className="w-2 h-2 bg-amber-500 rounded-full"></span> Spatial Analytics & Component Credits
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                     {viewProperty.amenity_credits && Object.entries(viewProperty.amenity_credits).map(([key, val]) => (
                        <div key={key} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-center">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{key}</p>
                           <p className="text-lg font-black text-emerald-600">+₹{Math.round(val).toLocaleString()}</p>
                        </div>
                     ))}
                     {(!viewProperty.amenity_credits || Object.keys(viewProperty.amenity_credits).length === 0) && (
                        <div className="col-span-full py-10 text-center text-gray-400 font-bold bg-gray-50 rounded-3xl">No spatial data available for credit calculation.</div>
                     )}
                  </div>
               </section>

               {/* Visual Verification */}
               {viewProperty.media && viewProperty.media.length > 0 && (
                  <section>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Asset Documentation Media
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {viewProperty.media.map(m => (
                        <div key={m.id} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-md">
                          {m.type === 'video' ? (
                            <video src={m.url.startsWith('http') ? m.url : `http://localhost:5000${m.url}`} className="w-full h-full object-cover" />
                          ) : (
                            <img src={m.url.startsWith('http') ? m.url : `http://localhost:5000${m.url}`} alt="Property" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">Expand</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
               )}
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button onClick={() => setViewModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 uppercase tracking-widest text-xs">Acknowledge & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyList;