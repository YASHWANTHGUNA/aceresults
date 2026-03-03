"use client";

import { useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";

export default function ResultsPage() {
  // ---------- Semester dropdown ----------
  const semesters = ["I-I", "I-II", "II-I", "II-II"];
  const [selectedSem, setSelectedSem] = useState("II-I");

  // ---------- Mock results data ----------
  const subjects = [
    {
      code: "23CS3101",
      name: "Data Structures",
      credits: 4,
      grade: "A+",
      status: "Pass",
    },
    {
      code: "23CS3102",
      name: "Computer Organization",
      credits: 3,
      grade: "A",
      status: "Pass",
    },
    {
      code: "23MA3103",
      name: "Discrete Mathematics",
      credits: 4,
      grade: "B+",
      status: "Pass",
    },
    {
      code: "23CS3104",
      name: "Operating Systems",
      credits: 3,
      grade: "A",
      status: "Pass",
    },
    {
      code: "23CS3105",
      name: "Database Management Systems",
      credits: 3,
      grade: "O",
      status: "Pass",
    },
    {
      code: "23CS3106",
      name: "Object Oriented Programming",
      credits: 3,
      grade: "A",
      status: "Pass",
    },
    {
      code: "23CS3107",
      name: "DBMS Lab",
      credits: 1,
      grade: "O",
      status: "Pass",
    },
    {
      code: "23CS3108",
      name: "OS Lab",
      credits: 1,
      grade: "A+",
      status: "Pass",
    },
    {
      code: "23PH1201",
      name: "Engineering Physics",
      credits: 3,
      grade: "C",
      status: "Pass",
      cleared: true, // backlog cleared
    },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white px-8 py-6">

      {/* ---------- Back link ---------- */}
      <Link
        href="/dashboard"
        className="text-sm text-blue-400 hover:underline"
      >
        ← Back to Dashboard
      </Link>

      {/* ---------- Title ---------- */}
      <div className="flex items-center justify-between mt-6">
        <h1 className="text-3xl font-semibold">Semester Results</h1>
      </div>

      {/* ---------- Semester Dropdown ---------- */}
      <div className="mt-6">
      <select
  className="
    bg-[#0f172a] 
    text-white 
    border border-white/10
    rounded-lg 
    px-4 py-2
    focus:outline-none 
    focus:ring-2 
    focus:ring-blue-500
  "
>
  <option className="bg-[#0f172a] text-white">I-I B.Tech</option>
  <option className="bg-[#0f172a] text-white">I-II B.Tech</option>
  <option className="bg-[#0f172a] text-white">II-I B.Tech</option>
  <option className="bg-[#0f172a] text-white">II-II B.Tech</option>
</select>
</div>

      {/* ---------- Stat Cards ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard title="Semester SGPA" value="8.85" />
        <StatCard title="Total Credits" value="22" />
        <StatCard title="Result Status" value="PASS" />
      </div>

      {/* ---------- Results Table ---------- */}
      <div className="mt-10 rounded-xl overflow-hidden bg-white/5 border border-white/10">

        {/* Table Header */}
        <div className="grid grid-cols-5 px-6 py-3 text-sm text-white/50">
          <span>Subject Code</span>
          <span>Subject Name</span>
          <span>Credits</span>
          <span>Grade</span>
          <span>Status</span>
        </div>

        {/* Table Rows */}
        {subjects.map((subj) => (
          <div
            key={subj.code}
            className="grid grid-cols-5 px-6 py-4 border-t border-white/10"
          >
            <span>{subj.code}</span>

            <span className="font-medium">
              {subj.name}
              {subj.cleared && (
                <span className="ml-2 text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                  CLEARED
                </span>
              )}
            </span>

            <span>{subj.credits}</span>

            <span className="text-blue-400 font-semibold">
              {subj.grade}
            </span>

            <span className="text-green-400">
              {subj.status}
            </span>
          </div>
        ))}
      </div>

      {/* ---------- Download Button ---------- */}
      <div className="mt-10 flex justify-center">
        <a
          href="/scorecards/II-I.pdf"
          download
          className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          ⬇ Download Semester Scorecard (PDF)
        </a>
      </div>

    </main>
  );
}