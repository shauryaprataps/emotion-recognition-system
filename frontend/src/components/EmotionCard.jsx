import { motion } from "framer-motion";
import ProbabilityBar from "./ProbabilityBar";

export default function EmotionCard({ title, result, highlight = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 ${highlight ? "ring-1 ring-brand-400/50" : ""}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-200">
          {result?.emotion || "Pending"}
        </span>
      </div>
      {result ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Confidence: <span className="font-semibold text-white">{(result.confidence * 100).toFixed(1)}%</span>
          </p>
          {Object.entries(result.probabilities || {}).map(([label, value]) => (
            <ProbabilityBar key={label} label={label} value={value} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Provide this modality to include it in fusion.</p>
      )}
    </motion.div>
  );
}
