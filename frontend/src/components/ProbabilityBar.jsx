export default function ProbabilityBar({ label, value, accent = "from-brand-400 to-cyan-300" }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="capitalize text-slate-300">{label}</span>
        <span className="font-semibold text-slate-100">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${accent} transition-all duration-500`}
          style={{ width: `${Math.max(4, value * 100)}%` }}
        />
      </div>
    </div>
  );
}
