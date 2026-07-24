// src/app/dashboard/page.jsx
"use client";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import ActionCard from "@/components/ActionCard";
import QuickLink from "@/components/QuickLink";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PerformanceChart from "@/components/PerformanceChart";

export default function Dashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/student/me")
      .then((res) => {
        if (!res.ok) throw new Error("unauthenticated");
        return res.json();
      })
      .then((data) => {
        if (data.success) setStudent(data.student);
        else router.push("/student-login");
      })
      .catch(() => router.push("/student-login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/student-login");
  };

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Loading...</div>;
  if (!student) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-white px-8 py-6 flex flex-col">
      <section className="mb-10 flex justify-between items-start">
        <div>
          <p className="text-green-400 text-sm mb-2">Welcome back</p>
          <h1 className="text-4xl font-bold">Welcome {student.name || student.rollNumber} 👋</h1>
          <p className="text-white/60 mt-2">Roll Number: {student.rollNumber}</p>
          <p className="text-white/60">Branch: {student.department}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition">
          Logout
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Section" value={student.section || "-"} />
        <StatCard title="Batch" value={student.batch || "-"} />
        <StatCard title="Status" value={student.status} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold mb-2">Results & Academic Actions</h2>
          <Link href="/results">
            <ActionCard title="View Semester Results" subtitle="Detailed breakdown of current semester" primary />
          </Link>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="space-y-3">
            <QuickLink label="Academic Calendar" />
            <QuickLink label="Exam Schedule" />
            <Link href="/feedback">
              <div className="bg-white/5 hover:bg-white/10 transition border border-white/10 rounded-xl p-4 cursor-pointer">
                <p className="font-medium">Feedback & Support</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <footer className="text-center mt-16 mb-4 text-sm text-gray-400 border-t border-white/10 pt-8">
        <p>ACE Engineering College Results Portal</p>
      </footer>
    </main>
  );
}