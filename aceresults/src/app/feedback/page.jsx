"use client";

import { useState } from "react";
import Link from "next/link";

export default function FeedbackPage() {
  const [rollNumber, setRollNumber] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rollNumber || !description) {
      alert("Please fill all required fields");
      return;
    }

    // Temporary handling (backend later)
    console.log({
      rollNumber,
      description,
      screenshot,
    });

    alert("Feedback submitted successfully!");

    // Reset form
    setRollNumber("");
    setDescription("");
    setScreenshot(null);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-8 flex justify-center">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-blue-400 hover:underline text-sm"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold">
            Feedback & Support
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
        >
          {/* Roll Number */}
          <div>
            <label className="block text-sm mb-2">
              Roll Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 23AG1A0501"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
              required
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
      Click to upload or drag & drop
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
  />
</div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-medium transition"
          >
            Submit Feedback
          </button>
        </form>

      </div>
    </main>
  );
}