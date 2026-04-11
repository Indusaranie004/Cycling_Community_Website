import React, { useState, useEffect } from "react";

export default function CreateInteraction({ onClose, onSubmit, onPickLocation, pickedLocation, selectedRoute, initialType   }) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
  intType: initialType || "hazard",
  intDescription: "",
  intRating: 5,
  severityLevel: "low",
  intLatitude: "",
  intLongitude: "",
  expiryTime: "3600000",
  fcmToken: "",
});
  const [file, setFile] = useState(null);

  // Auto-generate or "capture" an FCM token when the component mounts
  useEffect(() => {
    const mockFCMToken = "fcm_" + Math.random().toString(36).substr(2, 16);
    setForm((prev) => ({ ...prev, fcmToken: mockFCMToken }));
  }, []);

  useEffect(() => {
  if (pickedLocation) {
    setForm(prev => ({
      ...prev,
      intLatitude: pickedLocation.lat.toFixed(6),
      intLongitude: pickedLocation.lng.toFixed(6),
    }));
  }
}, [pickedLocation]);

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

  // CreateInteraction.jsx -> handleSubmit function

// CreateInteraction.jsx -> handleSubmit function

// CreateInteraction.jsx

const handleSubmit = async () => {
  if (!form.intDescription) return alert("Please add a description");
  if (form.intType === "feedback" && !selectedRoute) return alert("Please select a route on the map before submitting feedback.");

  setLoading(true);
  try {
    const data = new FormData();
    
    // 1. Append text fields
    data.append("intType", form.intType);
    data.append("intDescription", form.intDescription);
    
    const savedToken = localStorage.getItem('fcmToken');
    data.append("fcmToken", savedToken || "");

    if (selectedRoute?._id) data.append("routeId", selectedRoute._id);

    if (form.intType === "feedback") {
      data.append("intRating", form.intRating);
    } else {
      data.append("severityLevel", form.severityLevel);
      if (form.intLatitude) data.append("intLatitude", form.intLatitude);
      if (form.intLongitude) data.append("intLongitude", form.intLongitude);
      
      // --- CALCULATE EXPIRY DATE ---
        if (form.expiryTime) {
          const durationMs = parseInt(form.expiryTime);
          const expiryDate = new Date(Date.now() + durationMs); // Current time + duration
          data.append("expiryTime", expiryDate.toISOString());
        }
    }

    // 2. Append file LAST
    if (file) {
      data.append("image", file);
    }

    // 3. Pass the FormData object to MapPage -> handleCreateSubmit
    await onSubmit(data); 
    onClose(); 
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

  const inputClasses = "w-full border border-brand-sage/40 rounded-lg p-2.5 mb-4 focus:ring-2 focus:ring-brand-orange outline-none bg-white text-brand-dark transition-all";
  const labelClasses = "block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-1 ml-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-brand-cream rounded-2xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand-dark">Report Interaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-dark">✕</button>
        </div>

        {/* Type Selection */}
        <label className={labelClasses}>Interaction Type</label>
        <select name="intType" value={form.intType} onChange={handleChange} className={inputClasses}>
          <option value="hazard">⚠️ Hazard</option>
          <option value="feedback">💬 Feedback</option>
        </select>

        {/* Route ID (Optional Association) */}
        {/* Route Association — only shown for feedback */}
{form.intType === "feedback" && (
  <div className="mb-4">
    <label className={labelClasses}>Associated Route</label>
    {selectedRoute ? (
      <div className="w-full border border-brand-sage rounded-lg p-2.5
        bg-brand-sage/10 text-brand-dark text-sm">
        <p className="font-semibold truncate">{selectedRoute.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {selectedRoute.startLocation || 'Start'} → {selectedRoute.endLocation || 'End'}
        </p>
      </div>
    ) : (
      <div className="w-full border border-dashed border-gray-300 rounded-lg p-2.5
        bg-gray-50 text-gray-400 text-sm text-center">
        Select a route on the map first
      </div>
    )}
  </div>
)}
        {/* Description */}
        <label className={labelClasses}>Description</label>
        <textarea name="intDescription" placeholder="Tell us what's happening..." value={form.intDescription} onChange={handleChange} rows="2" className={inputClasses} />

        {/* Rating for Feedback */}
        {form.intType === "feedback" && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <label className={labelClasses}>Rating (1–5)</label>
            <input type="number" name="intRating" min="1" max="5" value={form.intRating} onChange={handleChange} className={inputClasses} />
          </div>
        )}

        {/* Hazard Specific Fields */}
        {form.intType === "hazard" && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 gap-x-4">
              <div className="col-span-2">
                <label className={labelClasses}>Severity</label>
                <select name="severityLevel" value={form.severityLevel} onChange={handleChange} className={inputClasses}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="col-span-2">
  <label className={labelClasses}>Location</label>
  {pickedLocation ? (
    <div className="w-full border border-brand-sage rounded-lg p-2.5 mb-4
      bg-brand-sage/10 text-brand-dark text-sm flex items-center justify-between">
      <span>📍 {pickedLocation.lat.toFixed(5)}, {pickedLocation.lng.toFixed(5)}</span>
      <button
        onClick={onPickLocation}
        className="text-xs text-brand-orange underline ml-2"
      >
        Change
      </button>
    </div>
  ) : (
    <button
      onClick={onPickLocation}
      className="w-full border-2 border-dashed border-brand-sage/50 rounded-lg
        p-2.5 mb-4 text-brand-dark/60 text-sm hover:border-brand-orange
        hover:text-brand-orange transition-colors text-center"
    >
      🗺️ Click to pick location on map
    </button>
  )}
</div>
            </div>
            
            {/* --- UPDATED EXPIRY TIME DROPDOWN --- */}
            <label className={labelClasses}>Clear Report After</label>
            <select name="expiryTime" value={form.expiryTime} onChange={handleChange} className={inputClasses}>
              <option value="60000">1 Minute (Testing)</option>
              <option value="3600000">1 Hour</option>
              <option value="7200000">2 Hours</option>
              <option value="43200000">12 Hours</option>
              <option value="86400000">1 Day</option>
            </select>
          </div>
        )}

        {/* Image Upload */}
        {/* <label className={labelClasses}>Upload Proof (Photo)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4 text-sm text-brand-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-white hover:file:bg-brand-orange/80 cursor-pointer" />

        {imagePreview && (
          <div className="mb-4 relative">
            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-brand-sage" />
            <button onClick={() => {setFile(null); setImagePreview(null);}} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
          </div>
        )} */}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-5 py-2.5 font-semibold text-brand-dark hover:bg-brand-sage/20 rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading || (form.intType === "feedback" && !selectedRoute)}
            className={`px-6 py-2.5 bg-brand-orange text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-orange/90'}`}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}