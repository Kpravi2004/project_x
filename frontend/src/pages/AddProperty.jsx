import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddProperty = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '', description: '', land_type_id: 1, price: '', area: '', 
    address: '', city: '', district: '', state: 'Tamil Nadu', 
    patta_number: '', survey_number: '', subdivision_number: '', village: '', taluk: '',
    // Contact Details
    contact_person_name: '', contact_phone: '', contact_email: '', contact_address: '',
    // Residential fields
    plot_shape: '', road_width: '', facing: '', water_connection: false, electricity_connection: false, approval_status: '',
    approval_number: '', gated_community: false, corner_plot: false, landmarks: '',
    // Agricultural fields
    soil_type: '', water_availability: false, irrigation_type: '', electricity_available: false, tree_type: '', tree_stage: '',
    soil_depth: '', road_access_type: '', distance_from_highway: '', fencing_details: ''
  });
  const [media, setMedia] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : (name === 'land_type_id' || name === 'price' || name === 'area' || name === 'road_width' || name === 'soil_depth' || name === 'distance_from_highway' ? (value === '' ? '' : parseFloat(value)) : value)
    });
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image'
    }));
    setMedia([...media, ...newMedia]);
  };

  const removeMedia = (index) => {
    const updated = [...media];
    updated.splice(index, 1);
    setMedia(updated);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalData = { ...formData, media_count: media.length };
      await axios.post('http://localhost:5000/api/properties', finalData);
      alert('Property listed successfully and pending admin verification.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error adding property');
    }
  };

  const renderStepper = () => (
    <div className="flex items-center justify-center mb-12">
      {[1, 2, 3, 4, 5].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-400'}`}>
            <span className="text-[10px]">{s}</span>
          </div>
          {s < 5 && <div className={`h-1 w-8 mx-1 transition-all ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
             <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>
          
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
              {step === 1 && "Basic Details"}
              {step === 2 && "Location & Survey"}
              {step === 3 && "Contact Details"}
              {step === 4 && (formData.land_type_id === 1 ? "Agricultural Features" : "Residential Features")}
              {step === 5 && "Media Upload"}
            </h2>
            <p className="text-gray-500 font-medium text-sm">Phase {step} of 5: {
              step === 1 ? "Start with the fundamentals." :
              step === 2 ? "Specify where the land is located." :
              step === 3 ? "How should buyers reach you?" :
              step === 4 ? "Detailed characteristics of the land." :
              "Showcase your property visually."
            }</p>
          </div>

          {renderStepper()}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Listing Title</label>
                  <input name="title" value={formData.title} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="e.g., 2 Acre Coconut Farm in Madurai" onChange={handleChange} />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Description</label>
                  <textarea name="description" value={formData.description} rows="4" required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium" placeholder="Land use, access, water, utilities, etc." onChange={handleChange}></textarea>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Land Type</label>
                  <select name="land_type_id" value={formData.land_type_id} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold appearance-none cursor-pointer" onChange={handleChange}>
                    <option value={1}>Agricultural</option>
                    <option value={2}>Residential</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (₹)</label>
                  <input type="number" name="price" value={formData.price} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="5000000" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Area ({formData.land_type_id === 1 ? 'Acres' : 'Sq Ft / Cents'})</label>
                  <input type="number" step="0.01" name="area" value={formData.area} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="2.5" onChange={handleChange} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">District</label>
                  <input name="district" value={formData.district} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="e.g., Madurai" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Taluk</label>
                  <input name="taluk" value={formData.taluk} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="e.g., Palayamkottai" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Village</label>
                  <input name="village" value={formData.village} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="e.g., Anna Nagar" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Address (Optional)</label>
                  <input name="address" value={formData.address} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Survey Number</label>
                  <input name="survey_number" value={formData.survey_number} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="e.g., 123/45" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Subdivision Number (Optional)</label>
                  <input name="subdivision_number" value={formData.subdivision_number} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="e.g., 45" onChange={handleChange} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="col-span-1 md:col-span-2">
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Contact Person Name</label>
                   <input name="contact_person_name" value={formData.contact_person_name} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="e.g., K. Rajendran" onChange={handleChange} />
                </div>
                <div>
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Contact Phone</label>
                   <input name="contact_phone" value={formData.contact_phone} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="9876543210" onChange={handleChange} />
                </div>
                <div>
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Contact Email</label>
                   <input type="email" name="contact_email" value={formData.contact_email} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="rajendran@example.com" onChange={handleChange} />
                </div>
                <div className="col-span-1 md:col-span-2">
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Contact Address (Optional)</label>
                   <textarea name="contact_address" value={formData.contact_address} rows="3" className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium" onChange={handleChange}></textarea>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {formData.land_type_id === 2 ? (
                  <>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Plot Shape</label>
                      <select name="plot_shape" value={formData.plot_shape} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange}>
                        <option value="">Select Shape</option>
                        <option value="regular">Regular</option>
                        <option value="irregular">Irregular</option>
                        <option value="corner">Corner</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Road Width (feet)</label>
                      <input type="number" name="road_width" value={formData.road_width} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" placeholder="30" onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Facing</label>
                      <select name="facing" value={formData.facing} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange}>
                        <option value="">Select Direction</option>
                        <option value="north">North</option>
                        <option value="south">South</option>
                        <option value="east">East</option>
                        <option value="west">West</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Approval Status</label>
                      <select name="approval_status" value={formData.approval_status} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange}>
                        <option value="">Select Type</option>
                        <option value="approved">Approved</option>
                        <option value="unapproved">Unapproved</option>
                        <option value="dtcp">DTCP</option>
                        <option value="cmda">CMDA</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                      <input type="checkbox" name="water_connection" checked={formData.water_connection} className="w-6 h-6 rounded accent-blue-600" onChange={handleChange} />
                      <label className="text-xs font-black text-blue-900 uppercase">Water Connection</label>
                    </div>
                    <div className="flex items-center space-x-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <input type="checkbox" name="electricity_connection" checked={formData.electricity_connection} className="w-6 h-6 rounded accent-emerald-600" onChange={handleChange} />
                      <label className="text-xs font-black text-emerald-900 uppercase">Electricity Connection</label>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Soil Type</label>
                      <select name="soil_type" value={formData.soil_type} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange}>
                        <option value="">Select Soil</option>
                        <option value="black">Black</option>
                        <option value="red">Red</option>
                        <option value="sandy">Sandy</option>
                        <option value="loamy">Loamy</option>
                        <option value="clay">Clay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Irrigation Type</label>
                      <select name="irrigation_type" value={formData.irrigation_type} required className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange}>
                        <option value="">Select Type</option>
                        <option value="canal">Canal</option>
                        <option value="borewell">Borewell</option>
                        <option value="well">Well</option>
                        <option value="rainfed">Rainfed</option>
                        <option value="drip">Drip</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tree Type (Optional)</label>
                      <select name="tree_type" value={formData.tree_type} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange}>
                        <option value="">None</option>
                        <option value="coconut">Coconut</option>
                        <option value="mango">Mango</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tree Stage (Optional)</label>
                      <select name="tree_stage" value={formData.tree_stage} className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold" onChange={handleChange}>
                        <option value="none">None</option>
                        <option value="young">Young</option>
                        <option value="half_grown">Half Grown</option>
                        <option value="full_grown">Full Grown</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                      <input type="checkbox" name="water_availability" checked={formData.water_availability} className="w-6 h-6 rounded accent-blue-600" onChange={handleChange} />
                      <label className="text-xs font-black text-blue-900 uppercase">Water Available</label>
                    </div>
                    <div className="flex items-center space-x-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <input type="checkbox" name="electricity_available" checked={formData.electricity_available} className="w-6 h-6 rounded accent-emerald-600" onChange={handleChange} />
                      <label className="text-xs font-black text-emerald-900 uppercase">Electricity Available</label>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-4 border-dashed border-gray-100 rounded-[3rem] p-12 text-center bg-gray-50/50 hover:bg-white hover:border-blue-200 transition-all group relative">
                  <input type="file" multiple accept="image/*,video/*" onChange={handleMediaChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Upload Visual Assets</h3>
                  <p className="text-gray-500 font-medium">Drag and drop photos or videos (max 10).</p>
                </div>

                {media.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {media.map((m, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
                        {m.type === 'video' ? <video src={m.preview} className="w-full h-full object-cover" /> : <img src={m.preview} alt="Upload" className="w-full h-full object-cover" />}
                        <button type="button" onClick={() => removeMedia(i)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-8">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-black py-5 rounded-2xl uppercase tracking-widest text-xs">
                  Back
                </button>
              )}
              {step < 5 ? (
                <button type="button" onClick={nextStep} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-2xl transition-all hover:-translate-y-1 uppercase tracking-widest text-xs">
                  Continue &rarr;
                </button>
              ) : (
                <button type="submit" className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-2xl transition-all hover:-translate-y-1 uppercase tracking-widest text-xs">
                  Complete Listing
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
