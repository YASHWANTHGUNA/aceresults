"use client";
import { useState } from "react";

export default function HODDashboard() {
  const [file, setFile] = useState(null);
  const [semester, setSemester] = useState("I-II");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a T-Sheet PDF to upload.");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("semester", semester);

    try {
      // Hitting your flawless backend engine!
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
        setFile(null); // Clear the file input on success
        // Reset the visual file input element
        document.getElementById("file-upload").value = ""; 
      } else {
        setError(data.error || data.message || "Upload failed.");
      }
    } catch (err) {
      setError("Server error. Please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 flex flex-col font-sans">
      
      {/* Top Navbar Area */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">HOD Portal</h1>
          <p className="text-sm text-slate-400">Department of Computer Science (CSM)</p>
        </div>
        <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm border border-slate-700">
          Logged in as: <span className="text-blue-400 font-semibold">CSM_HOD</span>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto mt-4">
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">T-Sheet Processing Engine</h2>
          
          <form onSubmit={handleUpload} className="space-y-6">
            
            {/* Semester Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Target Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="I-I">Year 1 - Semester I</option>
                <option value="I-II">Year 1 - Semester II</option>
                <option value="II-I">Year 2 - Semester I</option>
                <option value="II-II">Year 2 - Semester II</option>
                <option value="III-I">Year 3 - Semester I</option>
                <option value="III-II">Year 3 - Semester II</option>
                <option value="IV-I">Year 4 - Semester I</option>
                <option value="IV-II">Year 4 - Semester II</option>
              </select>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Upload T-Sheet (PDF only)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors">
                <div className="space-y-2 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-slate-400 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {file ? <span className="text-emerald-400 font-semibold">{file.name}</span> : "PDF up to 10MB"}
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback Messages */}
            {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded border border-red-400/20">{error}</div>}
            {message && <div className="text-emerald-400 text-sm bg-emerald-400/10 p-3 rounded border border-emerald-400/20">{message}</div>}

            {/* Action Button */}
            <button
              type="submit"
              disabled={uploading || !file}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${uploading || !file ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 transition-colors'}`}
            >
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing Engine Running...
                </span>
              ) : (
                "Process T-Sheet & Map Students"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}