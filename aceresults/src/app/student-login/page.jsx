"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentLogin() {
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed. Check your roll number and password.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Student Login</h1>
          <p className="text-sm text-slate-400 mt-2">ACE Engineering College Results Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Roll Number
            </label>
            <input
              type="text"
              placeholder="e.g. 23AG1A6601"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 uppercase focus:outline-none focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Default password is your Roll Number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="text-center text-sm text-slate-400 pt-2">
            <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              New student? Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}