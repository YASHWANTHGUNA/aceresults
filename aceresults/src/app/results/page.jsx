"use client";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Link from "next/link";

export default function ResultsPage() {
  const [result, setResult] = useState(null);
  const [rollNumber, setRollNumber] = useState("");
  const [semester, setSemester] = useState("II-I");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRollNumber = localStorage.getItem("rollNumber");

      if (!storedRollNumber) {
        window.location.href = "/";
        return;
      }

      setRollNumber(storedRollNumber);
    }
  }, []);

  const fetchResult = async () => {
    if (!rollNumber) {
      setError("Roll number not found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rollNumber: rollNumber,
          semester: semester,
        }),
      });

      const data = await res.json();

      if (!data || data.message === "Result not found") {
        setError("Result not available yet for this semester");
        setResult(null);
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Failed to fetch results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById("result-sheet");

    // clone the element to remove tailwind styles
    const clone = element.cloneNode(true);

    // Remove all classes to strip Tailwind styles
    clone.className = "";
    clone.querySelectorAll("*").forEach((el) => {
      el.className = "";
    });

    clone.style.background = "white";
    clone.style.color = "black";
    clone.style.padding = "20px";
    clone.style.fontFamily = "Arial, sans-serif";
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "-9999px";

    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
    });

    document.body.removeChild(clone);

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

    // Dynamic filename with roll number and semester
    pdf.save(
      `${result.rollNumber}_${semester.replace("-", "_")}_Semester_Result.pdf`,
    );
  };

  const getStatusColor = (status) => {
    return status === "PASS" ? "text-green-400" : "text-red-400";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-8">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="text-blue-400 hover:underline mb-6 inline-block"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">Semester Results</h1>

      {/* Semester Selector */}
      <div className="mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm mb-2 text-white/80">
            Select Semester
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="I-I">I-I</option>
            <option value="I-II">I-II</option>
            <option value="II-I">II-I</option>
            <option value="II-II">II-II</option>
          </select>
        </div>

        <button
          onClick={fetchResult}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium transition"
        >
          {loading ? "Loading..." : "Check Results"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <>
          <div
            id="result-sheet"
            className="bg-white text-black p-8 mt-6 rounded-lg"
          >
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4">{result.rollNumber}</h2>

              <p className="mb-4 font-semibold text-lg">
                Semester: {result.semester}
              </p>

              <table className="mt-6 w-full border border-gray-500 text-center">
                <thead style={{ backgroundColor: "#333", color: "white" }}>
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Credits</th>
                    <th className="p-3">Grade</th>
                  </tr>
                </thead>

                <tbody>
                  {result.subjects.map((sub, index) => (
                    <tr key={index} style={{ borderTop: "1px solid #999" }}>
                      <td className="p-3 text-left">{sub.subjectName}</td>
                      <td className="p-3">{sub.credits}</td>
                      <td className="p-3 font-semibold text-lg">{sub.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 space-y-2 border-t border-gray-300 pt-4">
                <p className="text-lg">
                  <span className="font-semibold">SGPA:</span> {result.sgpa}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">CGPA:</span> {result.cgpa}
                </p>
                <p
                  className={`text-lg font-bold ${getStatusColor(result.status)}`}
                >
                  Status: {result.status}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={downloadPDF}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium transition"
            >
              📥 Download Result Memo
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="text-center mt-16 text-sm text-gray-400 border-t border-white/10 pt-8">
        <p>ACE Engineering College Results Portal</p>
      </footer>
    </div>
  );
}
