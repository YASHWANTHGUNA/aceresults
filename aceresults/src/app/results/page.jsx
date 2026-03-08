"use client";
import { useState } from "react";

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
        <div className="mt-6">
          <h2 className="text-xl font-semibold">
            Roll Number: {result.rollNumber}
          </h2>

          <h3>Semester: {result.semester}</h3>

          <table className="mt-6 w-full border border-gray-500 text-center">
  <thead className="bg-gray-800">
    <tr>
      <th className="p-2">Subject</th>
      <th className="p-2">Credits</th>
      <th className="p-2">Grade</th>
    </tr>
  </thead>

  <tbody>
    {result.subjects.map((sub, index) => (
      <tr key={index} className="border-t border-gray-600">
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
          <div className="flex justify center mt-6">
          <button className="mt-6 bg-green-600 px-4 py-2 rounded text-white">
              Download Marks Memo
          </button>
          </div>
        </div>
      )}
    </div>
  );
}
