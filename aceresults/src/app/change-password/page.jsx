"use client";

import { useState } from "react";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    const rollNumber = localStorage.getItem("rollNumber");

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
  };

  return (
    <div className="p-6 max-w-md mx-auto">

      <h1 className="text-2xl font-bold mb-4">Change Password</h1>

      <input
        type="password"
        placeholder="Old Password"
        className="border p-2 w-full mb-3"
        onChange={(e) => setOldPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="New Password"
        className="border p-2 w-full mb-3"
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        className="border p-2 w-full mb-3"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        onClick={handleChangePassword}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Update Password
      </button>

    </div>
  );
}