export default function StatCard({ title, value }) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <p className="text-sm text-white/60">{title}</p>
        <p className="text-3xl font-semibold mt-2">{value}</p>
      </div>
    );
  }