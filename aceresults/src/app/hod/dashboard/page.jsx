// src/app/hod/dashboard/page.jsx
"use client";
import { useState, useEffect } from "react";

export default function HODDashboard() {
  // ---- Student Master Management state ----
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvMessage, setCsvMessage] = useState(null);
  const [csvError, setCsvError] = useState(null);
  const [csvSummary, setCsvSummary] = useState(null);
  const [invalidRows, setInvalidRows] = useState([]);
  const [studentStats, setStudentStats] = useState({ total: 0, recent: [] });

  // ---- Results Management state (unchanged) ----
  const [file, setFile] = useState(null);
  const [semester, setSemester] = useState("I-II");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchStudentStats = async () => {
    try {
      const res = await fetch("/api/upload-students");
      const data = await res.json();
      if (data.success) setStudentStats({ total: data.total, recent: data.recent });
    } catch (err) {
      // non-critical
    }
  };

  useEffect(() => {
     fetchStudentStats();
  }, []);

  const handleCsvChange = (e) => {
    const selected = e.target.files[0];
    if (selected && !selected.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please upload a valid .csv file.");
      setCsvFile(null);
      return;
    }
    setCsvError(null);
    setCsvFile(selected);
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setCsvError("Please select a student CSV to upload.");
      return;
    }
    setCsvUploading(true);
    setCsvError(null);
    setCsvMessage(null);
    setCsvSummary(null);
    setInvalidRows([]);

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const res = await fetch("/api/upload-students", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setCsvMessage(data.message);
        setCsvSummary(data.summary);
        setInvalidRows(data.invalidRows || []);
        setCsvFile(null);
        document.getElementById("csv-upload").value = "";
        fetchStudentStats();
      } else {
        setCsvError(data.message || "Upload failed.");
        setInvalidRows(data.invalidRows || []);
      }
    } catch (err) {
      setCsvError("Server error. Please check your connection.");
    } finally {
      setCsvUploading(false);
    }
  };

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
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
        setFile(null);
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
      <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">HOD Portal</h1>
          <p className="text-sm text-slate-400">Department of Computer Science (CSM)</p>
        </div>
        <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm border border-slate-700">
          Logged in as: <span className="text-blue-400 font-semibold">CSM_HOD</span>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto mt-4 space-y-10">

        {/* ============ STUDENT MASTER MANAGEMENT ============ */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Student Master Management</h2>
            <span className="text-sm text-slate-400">
              Total Students: <span className="text-blue-400 font-semibold">{studentStats.total}</span>
            </span>
          </div>

          <form onSubmit={handleCsvUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Upload Student CSV</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors">
                <div className="space-y-2 text-center">
                  <div className="flex text-sm text-slate-400 justify-center">
                    <label htmlFor="csv-upload" className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300">
                      <span>Upload a file</span>
                      <input id="csv-upload" type="file" accept=".csv" className="sr-only" onChange={handleCsvChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {csvFile ? <span className="text-emerald-400 font-semibold">{csvFile.name}</span> : "CSV up to 5MB"}
                  </p>
                  <p className="text-xs text-slate-600">
                    Columns: Roll Number, Name, Department, Section, Batch, Email, Mobile
                  </p>
                </div>
              </div>
            </div>

            {csvError && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded border border-red-400/20">{csvError}</div>}
            {csvMessage && <div className="text-emerald-400 text-sm bg-emerald-400/10 p-3 rounded border border-emerald-400/20">{csvMessage}</div>}

            {csvSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                  <p className="text-slate-400">Added</p>
                  <p className="text-emerald-400 font-bold text-lg">{csvSummary.added}</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                  <p className="text-slate-400">Updated</p>
                  <p className="text-blue-400 font-bold text-lg">{csvSummary.updated}</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                  <p className="text-slate-400">Duplicates</p>
                  <p className="text-yellow-400 font-bold text-lg">{csvSummary.duplicates}</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                  <p className="text-slate-400">Invalid Rows</p>
                  <p className="text-rose-400 font-bold text-lg">{csvSummary.invalid}</p>
                </div>
              </div>
            )}

            {invalidRows.length > 0 && (
              <div className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-rose-400 text-sm font-semibold mb-2">Rejected Rows ({invalidRows.length})</p>
                <ul className="text-xs text-slate-400 space-y-1">
                  {invalidRows.map((r, i) => (
                    <li key={i}>
                      Row {r.rowIndex} ({r.row.rollNumber || "?"}): {r.errors.join("; ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={csvUploading || !csvFile}
              className={`w-full py-3 px-4 rounded-md text-sm font-medium text-white
                ${csvUploading || !csvFile ? "bg-slate-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transition-colors"}`}
            >
              {csvUploading ? "Importing Students..." : "Upload Student CSV"}
            </button>
          </form>
        </div>

        {/* ============ RESULTS MANAGEMENT (unchanged) ============ */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Results Management — T-Sheet Processing</h2>

          <form onSubmit={handleUpload} className="space-y-6">
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

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Upload T-Sheet (PDF only)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors">
                <div className="space-y-2 text-center">
                  <div className="flex text-sm text-slate-400 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300">
                      <span>Upload a file</span>
                      <input id="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {file ? <span className="text-emerald-400 font-semibold">{file.name}</span> : "PDF up to 10MB"}
                  </p>
                </div>
              </div>
            </div>

            {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded border border-red-400/20">{error}</div>}
            {message && <div className="text-emerald-400 text-sm bg-emerald-400/10 p-3 rounded border border-emerald-400/20">{message}</div>}

            <button
              type="submit"
              disabled={uploading || !file}
              className={`w-full py-3 px-4 rounded-md text-sm font-medium text-white
                ${uploading || !file ? "bg-slate-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transition-colors"}`}
            >
              {uploading ? "Processing Engine Running..." : "Process T-Sheet & Map Students"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}