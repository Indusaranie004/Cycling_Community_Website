import React, { useState, useEffect } from "react";

export default function EditInteractionModal({ interaction, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(interaction.intImgUrl || null);
  const [file, setFile] = useState(null);

  // Sync state with the existing interaction data
  const [form, setForm] = useState({
    ...interaction,
    // Ensure IDs are handled as strings
    routeId: interaction.routeId?._id || interaction.routeId || "",
    // Default expiry duration selection for editing (optional reset)
    expiryTime: "keep", 
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      
      // Basic Fields
      data.append("intDescription", form.intDescription);
      data.append("intType", form.intType);

      // Condition-based fields
      if (form.intType === 'hazard') {
        data.append("severityLevel", form.severityLevel);
        data.append("intLatitude", Number(form.intLatitude));
        data.append("intLongitude", Number(form.intLongitude));
        
        // Expiry Logic: Only update if a new duration is selected
        if (form.expiryTime !== "keep") {
          const durationMs = parseInt(form.expiryTime);
          const expiryDate = new Date(Date.now() + durationMs);
          data.append("expiryTime", expiryDate.toISOString());
        }
      } else {
        data.append("intRating", Number(form.intRating));
      }

      if (form.routeId) data.append("routeId", form.routeId);
      
      if (file) {
        data.append("image", file);
      }

      await onSubmit(interaction._id, data);
      onClose();
    } catch (err) {
      console.error("Update Error:", err);
      alert("Update failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  // Matching classes from CreateInteraction
  const inputClasses = "w-full border border-brand-sage/40 rounded-lg p-2.5 mb-4 focus:ring-2 focus:ring-brand-orange outline-none bg-white text-brand-dark transition-all";
  const labelClasses = "block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-1 ml-1";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-brand-cream rounded-2xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">Edit Report</h2>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">ID: {interaction._id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-dark text-xl">✕</button>
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

        {/* Hazard Specific Fields */}
        {form.intType === 'hazard' ? (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <label className={labelClasses}>Severity</label>
            <select name="severityLevel" value={form.severityLevel} onChange={handleChange} className={inputClasses}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <label className={labelClasses}>Lat</label>
                <input type="number" name="intLatitude" value={form.intLatitude} onChange={handleChange} className={inputClasses} step="any" />
              </div>
              <div>
                <label className={labelClasses}>Lng</label>
                <input type="number" name="intLongitude" value={form.intLongitude} onChange={handleChange} className={inputClasses} step="any" />
              </div>
            </div>

            <label className={labelClasses}>Reset Expiry Duration</label>
            <select name="expiryTime" value={form.expiryTime} onChange={handleChange} className={inputClasses}>
              <option value="keep">Keep Current Expiry</option>
              <option value="3600000">1 Hour from now</option>
              <option value="7200000">2 Hours from now</option>
              <option value="43200000">12 Hours from now</option>
              <option value="86400000">1 Day from now</option>
            </select>
          </div>
        ) : (
          /* Feedback Specific Fields */
          <div className="animate-in slide-in-from-top-2 duration-300">
            <label className={labelClasses}>Rating (1-5)</label>
            <input type="number" name="intRating" value={form.intRating} onChange={handleChange} min="1" max="5" className={inputClasses} />
          </div>
        )}

        {/* Image Preview and Upload */}
        <label className={labelClasses}>Update Photo</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileChange} 
          className="mb-4 text-xs text-brand-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-sage/20 file:text-brand-dark hover:file:bg-brand-sage/40 cursor-pointer" 
        />

        {imagePreview && (
          <div className="mb-6 relative">
            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-brand-sage/30 shadow-inner" />
            <button 
              onClick={() => {setFile(null); setImagePreview(null);}} 
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
            >
              ✕
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-brand-sage/10">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-semibold text-brand-dark hover:bg-brand-sage/10 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className={`bg-brand-orange text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-orange/20 transform active:scale-95 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-orange/90'}`}
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}