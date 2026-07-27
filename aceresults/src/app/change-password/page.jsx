// src/app/change-password/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STEP = { FORM: "form", OTP: "otp" };

export default function ChangePassword() {
  const [step, setStep] = useState(STEP.FORM);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const maskEmail = (value) => {
    if (!value || !value.includes("@")) return "";
    const [localPart, domain] = value.split("@");
    if (localPart.length <= 2) {
      return `${localPart[0] || ""}***@${domain}`;
    }
    return `${localPart.slice(0, 2)}***@${domain}`;
  };

  useEffect(() => {
    // Pull roll number and verified email from the logged-in session
    fetch("/api/student/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRollNumber(data.student.rollNumber);
          if (data.student.email) {
            setEmail(data.student.email);
          } else {
            setError("No verified email found in your account record.");
          }
        } else {
          window.location.href = "/student-login";
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (!email) {
      setError("No verified email found for OTP delivery");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/change-password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setInfo(data.message);
      setStep(STEP.OTP);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit code sent to your email");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/change-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed");
        return;
      }

      setInfo(data.message);
      setTimeout(() => {
        window.location.href = "/student-login";
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/change-password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not resend OTP");
        return;
      }

      setInfo("A new OTP has been sent.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-8 flex flex-col">
      <div className="flex-grow flex justify-center items-center">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Change Password</h1>
            <p className="text-white/60 text-sm mt-2">
              {step === STEP.FORM
                ? "Verify your identity and set a new password"
                : "Enter the code sent to your email"}
            </p>
          </div>

          <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs text-white/60">Roll Number</p>
            <p className="font-semibold">{rollNumber}</p>
          </div>

          {email && (
            <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs text-white/60">OTP will be sent to</p>
              <p className="font-semibold">{maskEmail(email)}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg">
              {info}
            </div>
          )}

          {step === STEP.FORM && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !email}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-3 rounded-lg font-medium transition"
              >
                {submitting ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === STEP.OTP && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">6-Digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 tracking-[0.5em] text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-3 rounded-lg font-medium transition"
              >
                {submitting ? "Verifying..." : "Verify & Update Password"}
              </button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep(STEP.FORM)}
                  className="text-white/60 hover:underline"
                  disabled={submitting}
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  className="text-blue-400 hover:underline"
                  disabled={submitting}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <Link
            href="/dashboard"
            className="text-blue-400 hover:underline text-sm mt-6 block text-center"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}