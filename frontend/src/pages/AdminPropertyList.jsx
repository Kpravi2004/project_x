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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Property #{selectedProperty.id}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={saveEdit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Title</label>
                  <input name="title" value={editForm.title || ''} onChange={handleEditChange} className="border rounded w-full p-2" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Price (₹)</label>
                  <input type="number" name="price" value={editForm.price || ''} onChange={handleEditChange} className="border rounded w-full p-2" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Area</label>
                  <input type="number" step="0.01" name="area" value={editForm.area || ''} onChange={handleEditChange} className="border rounded w-full p-2" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Land Type</label>
                  <select name="land_type_id" value={editForm.land_type_id || ''} onChange={handleEditChange} className="border rounded w-full p-2">
                    <option value="1">Agricultural</option>
                    <option value="2">Residential</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">District</label>
                  <input name="district" value={editForm.district || ''} onChange={handleEditChange} className="border rounded w-full p-2" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Taluk</label>
                  <input name="taluk" value={editForm.taluk || ''} onChange={handleEditChange} className="border rounded w-full p-2" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Village</label>
                  <input name="village" value={editForm.village || ''} onChange={handleEditChange} className="border rounded w-full p-2" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Survey Number</label>
                  <input name="survey_number" value={editForm.survey_number || ''} onChange={handleEditChange} className="border rounded w-full p-2" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Patta Document URL</label>
                  <input name="patta_document_url" value={editForm.patta_document_url || ''} onChange={handleEditChange} className="border rounded w-full p-2" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">FMB Sketch URL</label>
                  <input name="fmb_sketch_url" value={editForm.fmb_sketch_url || ''} onChange={handleEditChange} className="border rounded w-full p-2" />
                </div>
                {/* Add more fields as needed */}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && viewProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
              <h2 className="text-2xl font-bold">Property Details #{viewProperty.id}</h2>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><strong>Title:</strong> {viewProperty.title}</div>
              <div><strong>Price:</strong> ₹{parseFloat(viewProperty.price).toLocaleString('en-IN')}</div>
              <div><strong>Area:</strong> {viewProperty.area} {viewProperty.land_type_id === 1 ? 'Acres' : 'Sq Ft'}</div>
              <div><strong>Land Type:</strong> {viewProperty.land_type_name}</div>
              <div><strong>District:</strong> {viewProperty.district}</div>
              <div><strong>Taluk:</strong> {viewProperty.taluk}</div>
              <div><strong>Village:</strong> {viewProperty.village}</div>
              <div><strong>Address:</strong> {viewProperty.address || 'N/A'}</div>
              <div><strong>Survey Number:</strong> {viewProperty.survey_number}</div>
              <div><strong>Subdivision Number:</strong> {viewProperty.subdivision_number || 'N/A'}</div>
              <div><strong>Patta Number:</strong> {viewProperty.patta_number || 'N/A'}</div>
              <div><strong>Owner:</strong> {viewProperty.owner_name}</div>
              <div><strong>Contact Person:</strong> {viewProperty.contact_person_name}</div>
              <div><strong>Contact Phone:</strong> {viewProperty.contact_phone}</div>
              <div><strong>Contact Email:</strong> {viewProperty.contact_email}</div>
            </div>

            {/* Land‑Type Specific */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Technical Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {viewProperty.land_type_id === 1 ? (
                  <>
                    <div><strong>Soil Type:</strong> {viewProperty.soil_type || 'N/A'}</div>
                    <div><strong>Soil Depth:</strong> {viewProperty.soil_depth ? `${viewProperty.soil_depth} ft` : 'N/A'}</div>
                    <div><strong>Water Available:</strong> {viewProperty.water_availability ? 'Yes' : 'No'}</div>
                    <div><strong>Irrigation Type:</strong> {viewProperty.irrigation_type || 'N/A'}</div>
                    <div><strong>Electricity Available:</strong> {viewProperty.electricity_available ? 'Yes' : 'No'}</div>
                    <div><strong>Tree Type:</strong> {viewProperty.tree_type || 'N/A'}</div>
                    <div><strong>Tree Stage:</strong> {viewProperty.tree_stage || 'N/A'}</div>
                    <div><strong>Road Access:</strong> {viewProperty.road_access_type || 'N/A'}</div>
                    <div><strong>Distance from Highway:</strong> {viewProperty.distance_from_highway ? `${viewProperty.distance_from_highway} km` : 'N/A'}</div>
                    <div><strong>Fencing Details:</strong> {viewProperty.fencing_details || 'N/A'}</div>
                  </>
                ) : (
                  <>
                    <div><strong>Plot Shape:</strong> {viewProperty.plot_shape || 'N/A'}</div>
                    <div><strong>Road Width:</strong> {viewProperty.road_width ? `${viewProperty.road_width} ft` : 'N/A'}</div>
                    <div><strong>Facing:</strong> {viewProperty.facing || 'N/A'}</div>
                    <div><strong>Water Connection:</strong> {viewProperty.water_connection ? 'Yes' : 'No'}</div>
                    <div><strong>Electricity Connection:</strong> {viewProperty.electricity_connection ? 'Yes' : 'No'}</div>
                    <div><strong>Approval Status:</strong> {viewProperty.approval_status || 'N/A'}</div>
                    <div><strong>Approval Number:</strong> {viewProperty.approval_number || 'N/A'}</div>
                    <div><strong>Corner Plot:</strong> {viewProperty.corner_plot ? 'Yes' : 'No'}</div>
                    <div><strong>Gated Community:</strong> {viewProperty.gated_community ? 'Yes' : 'No'}</div>
                    <div><strong>Nearby Landmarks:</strong> {viewProperty.landmarks || 'N/A'}</div>
                  </>
                )}
              </div>
            </div>

            {/* Amenities & Prediction */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Geospatial Intelligence</h3>
              {viewProperty.amenities_data && (
                <>
                  <div className="mb-2"><strong>Counts:</strong> {JSON.stringify(viewProperty.amenities_data.counts)}</div>
                  <div><strong>Nearest Distances (m):</strong> {JSON.stringify(viewProperty.amenities_data.distances)}</div>
                </>
              )}
              {viewProperty.amenity_credits && (
                <div className="mt-2">
                  <strong>Amenity Credits:</strong>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.entries(viewProperty.amenity_credits).map(([key, val]) => (
                      <div key={key} className="bg-gray-100 p-1 rounded">{key}: +₹{Math.round(val).toLocaleString()}</div>
                    ))}
                  </div>
                </div>
              )}
              {viewProperty.predicted_price && (
                <div className="mt-3 text-lg font-bold text-blue-600">
                  Predicted Price: ₹{parseFloat(viewProperty.predicted_price).toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* Media */}
            {viewProperty.media && viewProperty.media.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Media</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {viewProperty.media.map(m => (
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

            <div className="flex justify-end">
              <button onClick={() => setViewModalOpen(false)} className="bg-blue-600 text-white px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyList;