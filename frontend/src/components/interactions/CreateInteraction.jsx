import React, { useState, useEffect } from "react";

export default function CreateInteraction({ onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    intType: "hazard",
    intDescription: "",
    intRating: 5,
    severityLevel: "low",
    intLatitude: "",
    intLongitude: "",
    routeId: "", // Added from Schema
    expiryTime: "", // Added from Schema
    fcmToken: "", // Added from Schema
  });
  const [file, setFile] = useState(null);

  // Auto-generate or "capture" an FCM token when the component mounts
  useEffect(() => {
    const mockFCMToken = "fcm_" + Math.random().toString(36).substr(2, 16);
    setForm((prev) => ({ ...prev, fcmToken: mockFCMToken }));
  }, []);

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
    if (!form.intDescription) return alert("Please add a description");
    if (form.intType === "hazard" && (!form.intLatitude || !form.intLongitude)) {
      return alert("Coordinates are required for hazards");
    }

    setLoading(true);
    try {
      const data = new FormData();

// Common fields
data.append("intType", form.intType);
data.append("intDescription", form.intDescription);

if (form.routeId) data.append("routeId", form.routeId);
if (form.fcmToken) data.append("fcmToken", form.fcmToken);

// Feedback
if (form.intType === "feedback") {
  data.append("intRating", form.intRating);
}

// Hazard
if (form.intType === "hazard") {
  data.append("severityLevel", form.severityLevel);
  data.append("intLatitude", form.intLatitude);
  data.append("intLongitude", form.intLongitude);
  if (form.expiryTime) data.append("expiryTime", form.expiryTime);
}

// Image
if (file) {
  data.append("image", file);
}
      await onSubmit(data);
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
        <label className={labelClasses}>Associated Route ID (Optional)</label>
        <input name="routeId" placeholder="Paste Route ID if applicable" value={form.routeId} onChange={handleChange} className={inputClasses} />

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
              <div>
                <label className={labelClasses}>Latitude</label>
                <input name="intLatitude" type="number" step="any" placeholder="7.273" value={form.intLatitude} onChange={handleChange} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Longitude</label>
                <input name="intLongitude" type="number" step="any" placeholder="80.460" value={form.intLongitude} onChange={handleChange} className={inputClasses} />
              </div>
            </div>
            
            {/* Expiry Time - Added from Schema */}
            <label className={labelClasses}>Report Expiry Time</label>
            <input name="expiryTime" type="datetime-local" value={form.expiryTime} onChange={handleChange} className={inputClasses} />
          </div>
        )}

        {/* Image Upload */}
        <label className={labelClasses}>Upload Proof (Photo)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4 text-sm text-brand-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-white hover:file:bg-brand-orange/80 cursor-pointer" />

        {imagePreview && (
          <div className="mb-4 relative">
            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-brand-sage" />
            <button onClick={() => {setFile(null); setImagePreview(null);}} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-5 py-2.5 font-semibold text-brand-dark hover:bg-brand-sage/20 rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className={`px-6 py-2.5 bg-brand-orange text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-orange/90'}`}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}