import Image from "next/image";
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] to-black text-white flex flex-col relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_70%)]"></div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 bg-[#102033]">
        <span className="font-semibold text-lg text-white">
          ACE Engineering College
        </span>

        <nav className="flex items-center gap-6 text-sm text-white">
          <a href="#" className="hover:opacity-90">
            Official Website
          </a>
          <a href="#" className="hover:opacity-90">
            Help & Support
          </a>

          <button
            type="button"
            aria-label="Toggle light/dark mode"
            className="p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        
        {/* Circular logo */}
        <div className="mb-8 rounded-full overflow-hidden border-4 border-[#1A2B42] shadow-lg bg-white">
          <Image
            src="/images/ace.jpg"
            alt="ACE Engineering College Logo"
            width={180}
            height={200}
            className="object-cover"
          />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          <span className="text-[#4285F4]">ACE</span>{" "}
          <span className="text-white">RESULTS</span>
        </h1>

        <p className="mt-4 text-white/80 text-base max-w-md">
          Fast. Clear. Reliable exam results for ACE students 🙂
        </p>

        <a
          href="/login"
          className="mt-8 inline-flex items-center gap-2 bg-[#4285F4] hover:bg-[#3367D6] text-white px-8 py-3.5 rounded-lg font-medium transition shadow-lg"
        >
          Login to Portal →
        </a>
      </section>
    </main>
  );
}
