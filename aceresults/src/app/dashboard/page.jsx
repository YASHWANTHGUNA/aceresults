"use client";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import ActionCard from "@/components/ActionCard";
import QuickLink from "@/components/QuickLink";
import Link from "next/link";
import PerformanceChart from "@/components/PerformanceChart";

export default function Dashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const roll = localStorage.getItem("rollNumber");
    if (!roll) {
      window.location.href = "/";
      return;
    }

    const studentData = localStorage.getItem("student");
    if (studentData) {
      setStudent(JSON.parse(studentData));
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!student) return <div>Redirecting...</div>;

  return (
    <main className="min-h-screen bg-[#020617] text-white px-8 py-6 flex flex-col">
      {/* Header */}
      <section className="mb-10">
        <p className="text-green-400 text-sm mb-2">Welcome back</p>
        <h1 className="text-4xl font-bold">Welcome {student.name} 👋</h1>
        <p className="text-white/60 mt-2">Roll Number: {student.rollNumber}</p>
        <p className="text-white/60">Branch: {student.branch}</p>
      </section>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="CGPA" value="8.42" />
        <StatCard title="Latest SGPA" value="8.85" />
        <StatCard title="Backlogs" value="0" />
      </section>

      {/* Main Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Results & Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold mb-2">
            Results & Academic Actions
          </h2>

          <Link href="/results">
            <ActionCard
              title="View Semester Results"
              subtitle="Detailed breakdown of current semester"
              primary
            />
          </Link>

          <Link href="/overall-results">
            <ActionCard
              title="View Overall Results"
              subtitle="Complete academic history and transcripts"
            />
          </Link>

          <ActionCard
            title="Download Scorecard"
            subtitle="Get official digital PDF scorecard"
          />
        </div>

        {/* Right: Quick Links */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>

          <div className="space-y-3">
            <QuickLink label="Academic Calendar" />
            <QuickLink label="Exam Schedule" />
            <QuickLink label="Fee Payment" />
            <Link href="/feedback">
              <div
                className="bg-white/5 hover:bg-white/10 transition
                  border border-white/10 rounded-xl p-4 cursor-pointer"
              >
                <p className="font-medium">Feedback & Support</p>
                <p className="text-sm text-white/50">
                  Report issues or suggestions
                </p>
              </div>
            </Link>
            <a href="/change-password">
              <button className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition font-medium">
                Change Password
              </button>
            </a>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-lg font-semibold mb-4">Performance Trend (GPA)</h2>

        <div className="mt-12">
          <PerformanceChart />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center mt-16 mb-4 text-sm text-gray-400 border-t border-white/10 pt-8">
        <p>ACE Engineering College Results Portal</p>
        <p className="text-xs text-gray-500 mt-2">© 2024 All Rights Reserved</p>
      </footer>
    </main>
  );
}
