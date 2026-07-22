"use client";
import { useState } from "react";

export default function StudentPortal() {
  const [rollNumber, setRollNumber] = useState("");
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchResults = async (e) => {
    e.preventDefault();

    // 1. THE SHIELD: Absolutely guarantee rollNumber is a valid string before proceeding
    if (!rollNumber || typeof rollNumber !== "string" || !rollNumber.trim()) {
      setError("Please enter a valid Roll Number.");
      return;
    }

    setLoading(true);
    setError("");
    setResultData(null);

    try {
      // 2. Safe Formatting: Force it to a string, trim spaces, and capitalize
      const safeRollNumber = String(rollNumber).trim().toUpperCase();

      // 3. The Fetch: Ensure you are using BACKTICKS ( ` ) here!
      const res = await fetch(`/api/results/${safeRollNumber}`);

      const rawText = await res.text();

      try {
        const data = JSON.parse(rawText);

        if (data.success) {
          setResultData(data.data[0]);
        } else {
          setError(
            data.message || "Could not find results for this Roll Number.",
          );
        }
      } catch (jsonErr) {
        console.error("Server sent non-JSON response:", rawText);
        setError(
          `Backend Error: Server sent text instead of JSON. Output: "${rawText.substring(0, 50)}..."`,
        );
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 flex flex-col items-center font-sans">
      {/* Header */}
      <div className="text-center mb-10 mt-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          ACE Engineering College
        </h1>
        <p className="text-slate-400">Student Result Portal</p>
      </div>

      {/* Search Box */}
      <form
        onSubmit={fetchResults}
        className="w-full max-w-md flex gap-2 mb-10"
      >
        <input
          type="text"
          placeholder="Enter Roll Number (e.g. 22AG5A6602)"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 uppercase placeholder:normal-case"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg w-full max-w-2xl text-center">
          {error}
        </div>
      )}

      {/* Results Scorecard */}
      {resultData && (
        <div className="w-full max-w-4xl bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
          {/* Card Header */}
          <div className="bg-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider">
                Roll Number
              </p>
              <h2 className="text-2xl font-bold text-white tracking-widest">
                {resultData.rollNumber}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 uppercase tracking-wider">
                Semester
              </p>
              <h2 className="text-xl font-semibold text-white">
                {resultData.semester}
              </h2>
            </div>
          </div>

          {/* Grades Grid */}
          <div className="p-6 grid grid-cols-3 gap-4 border-b border-slate-700 bg-slate-800/50">
            <div className="text-center p-4 bg-slate-900 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">SGPA</p>
              <p className="text-3xl font-bold text-blue-400">
                {resultData.sgpa?.toFixed(2) || "N/A"}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-900 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">CGPA</p>
              <p className="text-3xl font-bold text-blue-400">
                {resultData.cgpa?.toFixed(2) || "N/A"}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-900 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">Status</p>
              <p
                className={`text-3xl font-bold ${resultData.status === "PASS" ? "text-emerald-400" : "text-red-400"}`}
              >
                {resultData.status}
              </p>
            </div>
          </div>

          {/* Detailed Subjects Table */}
          <div className="p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Detailed Subject Results
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm tracking-wider">
                  <th className="py-3 px-4 font-medium">Subject Code</th>
                  <th className="py-3 px-4 font-medium">Subject Name</th>
                  <th className="py-3 px-4 font-medium text-center">Grade</th>
                  <th className="py-3 px-4 font-medium text-center">Status</th>
                  <th className="py-3 px-4 font-medium text-center">Credits</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 text-sm">
                {resultData.subjects.map((sub, index) => {
                  // The Parsing Logic: Splitting the raw string from the database
                  const raw =
                    sub.rawString ||
                    sub.rawExtractedString ||
                    sub.subjectCode ||
                    "";
                  const parts = raw.trim().split(/\s+/);

                  let credits = "-",
                    status = "-",
                    grade = "-",
                    code = sub.subjectCode,
                    name = "-";

                  // Safely assign variables if the string has all expected components
                  if (parts.length > 4) {
                    credits = parts.pop();
                    status = parts.pop();
                    grade = parts.pop();
                    code = parts.shift();
                    name = parts.join(" "); // Everything left in the middle is the subject name
                  } else {
                    name = raw; // Fallback in case of a weirdly formatted string
                  }

                  return (
                    <tr
                      key={index}
                      className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-blue-400 whitespace-nowrap">
                        {code}
                      </td>
                      <td className="py-3 px-4 font-medium">{name}</td>
                      <td
                        className={`py-3 px-4 text-center font-bold ${grade.includes("F") ? "text-red-400" : "text-emerald-400"}`}
                      >
                        {grade}
                      </td>
                      <td
                        className={`py-3 px-4 text-center font-bold ${status === "F" ? "text-red-400" : "text-slate-300"}`}
                      >
                        {status}
                      </td>
                      <td className="py-3 px-4 text-center">{credits}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
