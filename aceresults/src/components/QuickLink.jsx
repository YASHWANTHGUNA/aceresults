export default function QuickLink({ label }) {
    return (
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 transition cursor-pointer">
        <span className="text-sm">{label}</span>
        <span className="text-white/40">↗</span>
      </div>
    );
  }