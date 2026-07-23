// src/app/admin/create-hod/page.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CreateHOD() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hods, setHods] = useState([]);
  const [loadingHods, setLoadingHods] = useState(true);

  const fetchHods = async () => {
    setLoadingHods(true);
    try {
      const res = await fetch("/api/admin/create-hod");
      const data = await res.json();
      if (data.success) setHods(data.hods);
    } catch (err) {
      // silent — non-critical for this view
    } finally {
      setLoadingHods(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHods();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/create-hod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, department }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
        setEmail("");
        setPassword("");
        setDepartment("");
        fetchHods();
      } else {
        setError(data.message || "Failed to create HOD account.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="text-blue-400 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Create HOD Account</h1>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                HOD Email
              </label>
              <input
                type="email"
                placeholder="hod.csm@aceec.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Department (e.g. CSM, CSE, ECE)
              </label>
              <input
                type="text"
                placeholder="CSM"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Temporary Password
              </label>
              <input
                type="text"
                placeholder="Set an initial password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {error && (
              <div className="text-rose-400 text-sm bg-rose-400/10 p-3 rounded border border-rose-400/20">
                {error}
              </div>
            )}
            {message && (
              <div className="text-emerald-400 text-sm bg-emerald-400/10 p-3 rounded border border-emerald-400/20">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create HOD Account"}
            </button>
          </form>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Existing HODs</h2>
          {loadingHods ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : hods.length === 0 ? (
            <p className="text-slate-400 text-sm">No HOD accounts created yet.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Department</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 text-sm">
                {hods.map((h) => (
                  <tr key={h._id} className="border-b border-slate-700/50">
                    <td className="py-2 px-3">{h.email}</td>
                    <td className="py-2 px-3 font-mono text-blue-400">{h.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}