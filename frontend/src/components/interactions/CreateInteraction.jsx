import React, { useState } from "react";

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
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create a local URL for the preview
    if (selectedFile) {
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!form.intDescription) return alert("Please add a description");
    
    setLoading(true);
    try {
      // Use FormData to send both text and files
      const data = new FormData();
      data.append("intType", form.intType);
      data.append("intDescription", form.intDescription);
      data.append("severityLevel", form.severityLevel);
      data.append("intRating", form.intRating);
      data.append("intLatitude", form.intLatitude);
      data.append("intLongitude", form.intLongitude);
      
      if (file) {
        data.append("image", file); // The key 'image' must match the backend multer key
      }

      await onSubmit(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full border border-brand-sage/40 rounded-lg p-2.5 mb-4 focus:ring-2 focus:ring-brand-orange outline-none bg-white text-brand-dark";
  const labelClasses = "block text-xs font-bold uppercase tracking-wider text-brand-dark/70 mb-1 ml-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-brand-cream rounded-2xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Report Interaction</h2>

        <label className={labelClasses}>Interaction Type</label>
        <select name="intType" value={form.intType} onChange={handleChange} className={inputClasses}>
          <option value="hazard">⚠️ Hazard</option>
          <option value="feedback">💬 Feedback</option>
        </select>

        <label className={labelClasses}>Description</label>
        <textarea name="intDescription" value={form.intDescription} onChange={handleChange} rows="2" className={inputClasses} />

        {/* Image Upload Field */}
        <label className={labelClasses}>Upload Proof (Photo)</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="mb-4 text-sm text-brand-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-white hover:file:bg-brand-orange/80 cursor-pointer"
        />

        {imagePreview && (
          <div className="mb-4 relative">
            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-brand-sage" />
            <button 
                onClick={() => {setFile(null); setImagePreview(null);}}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
            >✕</button>
          </div>
        )}

        {form.intType === "hazard" && (
          <div className="grid grid-cols-2 gap-x-4">
            <div className="col-span-2">
              <label className={labelClasses}>Severity</label>
              <select name="severityLevel" value={form.severityLevel} onChange={handleChange} className={inputClasses}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <input name="intLatitude" type="number" placeholder="Lat" onChange={handleChange} className={inputClasses} />
            <input name="intLongitude" type="number" placeholder="Lng" onChange={handleChange} className={inputClasses} />
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-5 py-2.5 font-semibold text-brand-dark">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className={`px-6 py-2.5 bg-brand-orange text-white font-bold rounded-xl shadow-lg ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? "Uploading..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}