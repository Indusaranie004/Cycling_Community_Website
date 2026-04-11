import React, { useState } from "react";

export default function EditInteractionModal({ interaction, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  
  // Helper to format ISO date from DB to HTML input format (YYYY-MM-DDTHH:MM)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    ...interaction,
    // Ensure we format the date correctly for the input
    expiryTime: formatDateForInput(interaction.expiryTime),
    // Ensure ID fields are strings for the inputs
    routeId: interaction.routeId?._id || interaction.routeId || ""
  });
  
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      
      // Only append fields if they have values to avoid 400 errors
      if (form.intDescription) data.append("intDescription", form.intDescription);
      if (form.intType) data.append("intType", form.intType);
      
      // Handle IDs carefully
      if (form.routeId && form.routeId.length === 24) { // Valid Mongo ID length
          data.append("routeId", form.routeId);
      }

      if (form.intType === 'hazard') {
        data.append("severityLevel", form.severityLevel);
        if (form.intLatitude) data.append("intLatitude", Number(form.intLatitude));
        if (form.intLongitude) data.append("intLongitude", Number(form.intLongitude));
        if (form.expiryTime) data.append("expiryTime", form.expiryTime);
        if (form.intRating) data.append("intRating", Number(form.intRating));
      } else {
        data.append("intRating", form.intRating);
      }
      
      if (file) {
        data.append("image", file);
      }

      await onSubmit(interaction._id, data);
      onClose();
    } catch (err) {
      // Log the specific error from the server
      console.error("Frontend Update Error:", err);
      alert("Update failed. Check if all required fields are correct.");
    } finally {
      setLoading(false);
    }
};

  const inputClasses = "w-full border border-brand-sage/40 rounded-lg p-2 mb-4 text-sm bg-white focus:ring-2 focus:ring-brand-orange outline-none";
  const labelClasses = "block text-[10px] font-bold uppercase text-brand-dark/50 mb-1 ml-1";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-brand-dark">Edit Report</h3>
          <span className="text-[10px] bg-brand-cream px-2 py-1 rounded font-mono text-gray-400">
            ID: {interaction._id.slice(-6)}
          </span>
        </div>
        
        {/* Description */}
        <label className={labelClasses}>Description</label>
        <textarea 
          name="intDescription" 
          value={form.intDescription} 
          onChange={handleChange} 
          className={inputClasses} 
          rows="2" 
        />

        {/* Route Association */}
        <label className={labelClasses}>Route ID (Optional)</label>
        <input 
          name="routeId" 
          value={form.routeId} 
          onChange={handleChange} 
          className={inputClasses} 
          placeholder="Route ObjectId"
        />

        {/* Hazard Specific Fields */}
        {form.intType === 'hazard' ? (
          <div className="grid grid-cols-2 gap-x-4 animate-in fade-in duration-300">
            <div className="col-span-2">
              <label className={labelClasses}>Severity Level</label>
              <select name="severityLevel" value={form.severityLevel} onChange={handleChange} className={inputClasses}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Latitude</label>
              <input type="number" name="intLatitude" value={form.intLatitude} onChange={handleChange} className={inputClasses} step="any" />
            </div>
            <div>
              <label className={labelClasses}>Longitude</label>
              <input type="number" name="intLongitude" value={form.intLongitude} onChange={handleChange} className={inputClasses} step="any" />
            </div>
            <div className="col-span-2">
              <label className={labelClasses}>Expiry Time</label>
              <input type="datetime-local" name="expiryTime" value={form.expiryTime} onChange={handleChange} className={inputClasses} />
            </div>
          </div>
        ) : (
          /* Feedback Specific Fields */
          <div className="animate-in fade-in duration-300">
            <label className={labelClasses}>Rating (1-5)</label>
            <input type="number" name="intRating" value={form.intRating} onChange={handleChange} min="1" max="5" className={inputClasses} />
          </div>
        )}

        {/* Image Update */}
        <label className={labelClasses}>Update Photo (Leave empty to keep current)</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])} 
          className="text-xs mb-6 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-sage/20 file:text-brand-dark hover:file:bg-brand-sage/40 cursor-pointer" 
        />

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-semibold text-brand-dark hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className={`bg-brand-orange text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-orange/20 transform active:scale-95 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-orange/90'}`}
          >
            {loading ? "Saving Changes..." : "Update Report"}
          </button>
        </div>
      </div>
    </div>
  );
}