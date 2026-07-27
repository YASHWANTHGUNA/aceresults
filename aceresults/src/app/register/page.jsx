"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STEP = { FORM: "form", OTP: "otp" };

export default function RegisterPage() {
  const [step, setStep] = useState(STEP.FORM);
  const [form, setForm] = useState({
    rollNumber: "", firstName: "", lastName: "", department: "",
    email: "", mobile: "", password: "", confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const router = useRouter();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const res = await fetch("/api/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed"); return; }
      setInfo(data.message);
      setStep(STEP.OTP);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const res = await fetch("/api/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber: form.rollNumber, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Verification failed"); return; }
      setInfo(data.message);
      setTimeout(() => router.push("/student-login"), 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Student Registration</h1>
          <p className="text-sm text-slate-400 mt-2">ACE Engineering College Results Portal</p>
        </div>

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
          <form onSubmit={handleRegister} className="space-y-4">
            <input required placeholder="Roll Number (e.g. 23AG1A0521)" value={form.rollNumber}
              onChange={update("rollNumber")}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 uppercase focus:outline-none focus:border-blue-500" />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="First Name" value={form.firstName} onChange={update("firstName")}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
              <input required placeholder="Last Name" value={form.lastName} onChange={update("lastName")}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            </div>
            <input required placeholder="Department (e.g. CSE, CSM)" value={form.department} onChange={update("department")}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 uppercase focus:outline-none focus:border-blue-500" />
            <input required type="email" placeholder="Email" value={form.email} onChange={update("email")}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            <input required placeholder="Mobile Number" value={form.mobile} onChange={update("mobile")}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            <input required type="password" placeholder="Create Password" value={form.password} onChange={update("password")}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            <input required type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={update("confirmPassword")}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50">
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        {step === STEP.OTP && (
          <form onSubmit={handleVerify} className="space-y-4">
            <input required type="text" inputMode="numeric" maxLength={6} placeholder="123456"
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 tracking-[0.5em] text-center text-xl focus:outline-none focus:border-blue-500" />
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50">
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/student-login" className="text-sm text-blue-400 hover:underline">
            Already have an account? Login here
          </Link>
        </div>
      </div>
    </div>
  );
}