"use client";
import Link from "next/link";
import { useState } from "react";

export default function AdminDashboard() {
  const [rollNumber, setRollNumber] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const searchStudent = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;

    setLoading(true);
    setError("");
    setMessage("");
    setStudentData(null);

    try {
      const res = await fetch(`/api/results/${rollNumber.toUpperCase()}`);
      const rawText = await res.text();

      try {
        const data = JSON.parse(rawText);
        if (data.success) {
          setStudentData(data.data[0]);
        } else {
          setError(data.message || "Record not found.");
        }
      } catch (jsonErr) {
        setError("Backend Error. Check server console.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async () => {
    if (
      !confirm(
        `WARNING: Are you sure you want to permanently delete the records for ${studentData.rollNumber}?`
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/results/${studentData.rollNumber}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
        setStudentData(null);
        setRollNumber("");
      } else {
        setError(data.message || "Failed to delete record.");
      }
    } catch (err) {
      setError("Network error during deletion.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 font-sans">
      {/* Admin Navbar */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-rose-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-rose-600/20">
            A
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Admin Control Center
            </h1>
            <p className="text-sm text-slate-400">ACE Engineering College ERP</p>
          </div>

          <Link
            href="/admin/create-hod"
            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Create HOD
          </Link>
        </div>

        <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm border border-slate-700 font-mono">
          System Status: <span className="text-emerald-400">ONLINE</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Search & Actions */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-white mb-4">Record Management</h2>
            <form onSubmit={searchStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Student Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 22AG5A6602"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-rose-500 uppercase"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Searching Database..." : "Fetch Record"}
              </button>
            </form>

            {error && (
              <div className="mt-4 text-rose-400 text-sm bg-rose-400/10 p-3 rounded border border-rose-400/20">
                {error}
              </div>
            )}
            {message && (
              <div className="mt-4 text-emerald-400 text-sm bg-emerald-400/10 p-3 rounded border border-emerald-400/20">
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Data View & Danger Zone */}
        <div className="lg:col-span-2">
          {studentData ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-widest">
                    {studentData.rollNumber}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Semester:{" "}
                    <span className="text-white font-semibold">
                      {studentData.semester}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Database ID</p>
                  <p className="text-xs font-mono text-slate-500">{studentData._id}</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-700 bg-slate-800/30">
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-center">
                  <p className="text-sm text-slate-400 mb-1">SGPA</p>
                  <p className="text-2xl font-bold text-white">
                    {studentData.sgpa?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-center">
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <p
                    className={`text-2xl font-bold ${
                      studentData.status === "PASS"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {studentData.status}
                  </p>
                </div>
              </div>

              <div className="p-6 overflow-x-auto border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
                  Granular Subject Data
                </h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs tracking-wider uppercase">
                      <th className="py-2 px-3 font-medium">Code</th>
                      <th className="py-2 px-3 font-medium">Subject Name</th>
                      <th className="py-2 px-3 font-medium text-center">Grade</th>
                      <th className="py-2 px-3 font-medium text-center">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                  {studentData.subjects.map((sub, index) => (
                    <tr key={index}>
                      <td>{sub.code}</td>
                      <td>{sub.name}</td>
                      <td
                        className={
                          sub.grade.includes("F")
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }
                      >
                        {sub.grade}
                      </td>
                      <td>{sub.credits}</td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>

              <div className="p-6 bg-rose-950/20">
                <h4 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Danger Zone
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Deleting this record will permanently remove it from the database.
                  The student will immediately lose access to these results.
                </p>
                <button
                  onClick={deleteRecord}
                  disabled={actionLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading
                    ? "Processing Deletion..."
                    : "Permanently Delete Record"}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-12 text-center text-slate-500">
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-slate-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p>
                  Search for a student roll number to view and manage their detailed
                  T-Sheet data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
