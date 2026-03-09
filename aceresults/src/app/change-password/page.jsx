"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const roll = localStorage.getItem("rollNumber");
    if (!roll) {
      window.location.href = "/";
      return;
    }
    setRollNumber(roll);
    setLoading(false);
  }, []);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (!oldPassword || !newPassword) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rollNumber,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-8 flex flex-col">
      <div className="flex-grow flex justify-center items-center">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Change Password</h1>
            <p className="text-white/60 text-sm mt-2">
              Update your account password securely
            </p>
          </div>

          {/* Roll Number Display */}
          <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs text-white/60">Roll Number</p>
            <p className="font-semibold">{rollNumber}</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Old Password</label>
              <input
                type="password"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">New Password</label>
              <input
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={isSubmitting}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-3 rounded-lg font-medium transition"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>

          {/* Back Link */}
          <Link
            href="/dashboard"
            className="text-blue-400 hover:underline text-sm mt-6 block text-center"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 border-t border-white/10 pt-6">
        <p>ACE Engineering College Results Portal</p>
      </footer>
    </main>
  );
}
