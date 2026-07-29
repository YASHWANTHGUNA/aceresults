"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const [rollNumber, setRollNumber] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/student/me")
      .then((res) => {
        if (!res.ok) throw new Error("unauthenticated");
        return res.json();
      })
      .then((data) => {
        if (!data.success) {
          router.push("/student-login");
          return;
        }
        setRollNumber(data.student.rollNumber);
      })
      .catch(() => router.push("/student-login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!description.trim()) {
      setError("Please describe the issue.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("description", description);
      if (screenshot) formData.append("screenshot", screenshot);

      const res = await fetch("/api/feedback", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Could not submit feedback. Please try again.");
        return;
      }

      setMessage(data.message);
      setDescription("");
      setScreenshot(null);
      const fileInput = document.getElementById("screenshot");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-8 flex flex-col">
      <div className="flex-grow flex justify-center">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="mb-10 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-blue-400 hover:underline text-sm"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-semibold">Feedback & Support</h1>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
          >
            {/* Roll Number (read-only, from session) */}
            <div>
              <label className="block text-sm mb-2">Roll Number</label>
              <input
                type="text"
                value={rollNumber}
                readOnly
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none text-white/70 cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none resize-none focus:border-blue-500"
                required
                disabled={submitting}
              />
            </div>

            {/* Screenshot */}
            <div>
              <label className="block text-sm mb-2">
                Screenshot (Optional)
              </label>

              <label
                htmlFor="screenshot"
                className="flex flex-col items-center justify-center
               border-2 border-dashed border-white/10
               rounded-xl p-8 cursor-pointer
               hover:bg-white/5 transition text-center"
              >
                <span className="text-white/60 mb-1">
                  {screenshot ? screenshot.name : "Click to upload or drag & drop"}
                </span>
                <span className="text-xs text-white/40">
                  PNG, JPG up to 5MB
                </span>
              </label>

              <input
                id="screenshot"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => setScreenshot(e.target.files[0])}
                className="hidden"
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg">
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 rounded-lg font-medium transition"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-10 text-sm text-gray-400 border-t border-white/10 pt-6">
        <p>ACE Engineering College Results Portal</p>
      </footer>
    </main>
  );
}