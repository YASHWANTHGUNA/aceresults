// src/app/results/page.jsx — key change only, rest of your JSX stays the same
"use client";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const [result, setResult] = useState(null);
  const [rollNumber, setRollNumber] = useState("");
  const [allResults, setAllResults] = useState([]);
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/student/me")
      .then((res) => {
        if (!res.ok) throw new Error("unauthenticated");
        return res.json();
      })
      .then((data) => {
        if (!data.success) { router.push("/student-login"); return; }
        setRollNumber(data.student.rollNumber);
        return fetch(`/api/results/${data.student.rollNumber}`);
      })
      .then((res) => res?.json())
      .then((data) => {
        if (data?.success) {
          setAllResults(data.data);
          setSemester(data.data[0]?.semester || "");
          setResult(data.data[0] || null);
        } else {
          setError(data?.message || "No results available yet.");
        }
      })
      .catch(() => router.push("/student-login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSemesterChange = (sem) => {
    setSemester(sem);
    setResult(allResults.find((r) => r.semester === sem) || null);
  };

  const downloadPDF = async () => {
    // unchanged from your existing implementation
    const element = document.getElementById("result-sheet");
    const clone = element.cloneNode(true);
    clone.className = "";
    clone.querySelectorAll("*").forEach((el) => { el.className = ""; });
    clone.style.background = "white";
    clone.style.color = "black";
    clone.style.padding = "20px";
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    document.body.appendChild(clone);
    const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
    document.body.removeChild(clone);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`${result.rollNumber}_${semester.replace("-", "_")}_Semester_Result.pdf`);
  };

  const getStatusColor = (status) => (status === "PASS" ? "text-green-400" : "text-red-400");

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-8">
      <Link href="/dashboard" className="text-blue-400 hover:underline mb-6 inline-block">← Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-6">Semester Results</h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">⚠️ {error}</div>
      )}

      {allResults.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm mb-2 text-white/80">Select Semester</label>
          <select
            value={semester}
            onChange={(e) => handleSemesterChange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none"
          >
            {allResults.map((r) => (
              <option key={r.semester} value={r.semester}>{r.semester}</option>
            ))}
          </select>
        </div>
      )}

      {result && (
        <>
          <div id="result-sheet" className="bg-white text-black p-8 mt-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{result.rollNumber}</h2>
            <p className="mb-4 font-semibold text-lg">Semester: {result.semester}</p>
            <table className="mt-6 w-full border border-gray-500 text-center">
              <thead style={{ backgroundColor: "#333", color: "white" }}>
                <tr><th className="p-3">Subject</th><th className="p-3">Credits</th><th className="p-3">Grade</th></tr>
              </thead>
              <tbody>
                {result.subjects.map((sub, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #999" }}>
                    <td className="p-3 text-left">{sub.name}</td>
                    <td className="p-3">{sub.credits}</td>
                    <td className="p-3 font-semibold text-lg">{sub.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 space-y-2 border-t border-gray-300 pt-4">
              <p className="text-lg"><span className="font-semibold">SGPA:</span> {result.sgpa ?? "-"}</p>
              <p className="text-lg"><span className="font-semibold">CGPA:</span> {result.cgpa ?? "-"}</p>
              <p className={`text-lg font-bold ${getStatusColor(result.status)}`}>Status: {result.status}</p>
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-medium transition">
              📥 Download Result Memo
            </button>
          </div>
        </>
      )}
    </div>
  );
}