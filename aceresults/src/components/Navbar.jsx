"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide Navbar (and thus Logout) on home and login pages
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  return (
    <nav className="flex justify-between items-center p-4 shadow bg-[#020617] text-white">
      <h1 className="font-bold text-xl">ACE RESULTS</h1>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </nav>
  );
}
