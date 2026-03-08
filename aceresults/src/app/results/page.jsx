"use client";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ResultsPage() {
  const [result, setResult] = useState(null);

  const fetchResult = async () => {
    const res = await fetch("/api/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rollNumber: "23AG1A0501",
        semester: "II-I",
      }),
    });

    const data = await res.json();
    setResult(data);
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

    pdf.save("ACE_Result_Memo.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Semester Results</h1>

      <button
        onClick={fetchResult}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Check Results
      </button>

      {result && (
        <>
          <div id="result-sheet" className="bg-white text-black p-6 mt-6">
            <div className="mt-6">
              <h2 className="text-xl font-semibold">
                Roll Number: {result.rollNumber}
              </h2>

              <h3>Semester: {result.semester}</h3>

              <table className="mt-6 w-full border border-gray-500 text-center">
                <thead style={{ backgroundColor: "#333" }}>
                  <tr>
                    <th className="p-2">Subject</th>
                    <th className="p-2">Credits</th>
                    <th className="p-2">Grade</th>
                  </tr>
                </thead>

                <tbody>
                  {result.subjects.map((sub, index) => (
                    <tr key={index} style={{ borderTop: "1px solid #999" }}>
                      <td className="p-2">{sub.subjectName}</td>
                      <td className="p-2">{sub.credits}</td>
                      <td className="p-2">{sub.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4">
                <p>SGPA: {result.sgpa}</p>
                <p>CGPA: {result.cgpa}</p>
                <p>Status: {result.status}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={downloadPDF}
              className="bg-green-600 px-4 py-2 rounded text-white"
            >
              Download Marks Memo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
