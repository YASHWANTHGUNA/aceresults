"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rollNumber,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("rollNumber", data.student.rollNumber);
        router.push("/dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] to-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-2">Student Login</h1>

        <p className="text-white/60 mb-6 text-sm">
          Securely access your semester exam results
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">Roll Number</label>
            <input
              type="text"
              placeholder="23AG1A0..."
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition"
          >
            Login
          </button>
        </form>

        <div className="flex justify-between mt-6 text-sm text-blue-400">
          <a href="#" className="hover:underline">
            Change password
          </a>
          <a href="#" className="hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </main>
  );
}
