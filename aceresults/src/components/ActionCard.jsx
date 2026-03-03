export default function ActionCard({ title, subtitle, primary }) {
    return (
      <div
        className={`rounded-xl p-6 border transition cursor-pointer
          ${primary
            ? "bg-blue-600 border-blue-500 hover:bg-blue-700"
            : "bg-white/5 border-white/10 hover:bg-white/10"
          }`}
      >
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-sm opacity-80 mt-1">{subtitle}</p>
      </div>
    );
  }